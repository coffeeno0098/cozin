type TrueMoneyStatus = {
  code?: string;
  message?: string;
  data?: unknown;
};

type TrueMoneyPayload = {
  status?: TrueMoneyStatus;
  data?: unknown;
};

type TrueMoneyTicket = {
  amount_baht?: string | number;
};

export type TrueMoneyRedeemResult =
  | {
      ok: true;
      amountBaht: number;
      statusCode: number;
      payload: TrueMoneyPayload;
    }
  | {
      ok: false;
      statusCode: number;
      code?: string;
      message: string;
      payload?: TrueMoneyPayload | null;
    };

const voucherCodePattern = /^[0-9A-Za-z]+$/;
const browserIdleTimeout = 1000 * 60 * 5;

type PuppeteerBrowser = Awaited<ReturnType<typeof import("puppeteer")["default"]["launch"]>>;
type PuppeteerPage = Awaited<ReturnType<PuppeteerBrowser["newPage"]>>;

let browserInstance: PuppeteerBrowser | null = null;
let browserLastUsed = 0;

export function extractTrueMoneyVoucherCode(input: string) {
  try {
    const url = new URL(input);
    const code = url.searchParams.get("v")?.trim();

    if (url.hostname !== "gift.truemoney.com" || !code || !voucherCodePattern.test(code)) {
      return null;
    }

    return code;
  } catch {
    const code = input.trim();
    return voucherCodePattern.test(code) ? code : null;
  }
}

export function getTrueMoneyMessage(code?: string, fallback?: string) {
  if (code === "VOUCHER_OUT_OF_STOCK") return "This gift link has already been fully redeemed.";
  if (code === "TARGET_USER_REDEEMED") return "This gift link was already redeemed by this receiver.";
  if (code === "VOUCHER_NOT_FOUND") return "TrueMoney gift link was not found.";
  if (code === "CANNOT_GET_OWN_VOUCHER") return "You cannot redeem your own TrueMoney gift link.";
  if (code === "VOUCHER_EXPIRED") return "This TrueMoney gift link has expired.";
  if (code === "INVALID_PHONE_NUMBER") return "The TrueMoney receiver phone number is invalid.";
  return fallback || "TrueMoney could not verify this gift link.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRecord(value: unknown, key: string) {
  if (!isRecord(value)) return undefined;
  return value[key];
}

function getTicket(payload: TrueMoneyPayload): TrueMoneyTicket | null {
  const statusData = payload.status?.data;
  const statusTickets = getRecord(statusData, "tickets");
  const dataTickets = getRecord(payload.data, "tickets");
  const candidates = [
    getRecord(statusData, "my_ticket"),
    Array.isArray(statusTickets) ? statusTickets[0] : undefined,
    getRecord(payload.data, "my_ticket"),
    Array.isArray(dataTickets) ? dataTickets[0] : undefined,
  ];

  const ticket = candidates.find(isRecord);
  return ticket ? { amount_baht: ticket.amount_baht as string | number | undefined } : null;
}

function getAmountBaht(payload: TrueMoneyPayload) {
  const ticket = getTicket(payload);
  const amount = Number(ticket?.amount_baht ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.floor(amount);
}

function buildRedeemResult(statusCode: number, payload: TrueMoneyPayload | null): TrueMoneyRedeemResult {
  if (!payload) {
    return {
      ok: false,
      statusCode,
      message: `TrueMoney returned an invalid response (HTTP ${statusCode})`,
      payload,
    };
  }

  if (payload.status?.code !== "SUCCESS") {
    return {
      ok: false,
      statusCode,
      code: payload.status?.code,
      message: getTrueMoneyMessage(payload.status?.code, payload.status?.message),
      payload,
    };
  }

  const amountBaht = getAmountBaht(payload);

  if (amountBaht <= 0) {
    return {
      ok: false,
      statusCode,
      code: "AMOUNT_NOT_FOUND",
      message: "Could not read the amount from the TrueMoney response.",
      payload,
    };
  }

  return {
    ok: true,
    amountBaht,
    statusCode,
    payload,
  };
}

async function redeemWithFetch(
  voucherCode: string,
  receiverPhone: string,
): Promise<TrueMoneyRedeemResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://gift.truemoney.com/campaign/?v=${voucherCode}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        mobile: receiverPhone,
        voucher_hash: voucherCode,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as TrueMoneyPayload | null;

    return buildRedeemResult(response.status, payload);
  } catch (error) {
    return {
      ok: false,
      statusCode: 0,
      message: error instanceof Error ? error.message : "Could not connect to TrueMoney.",
      payload: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getBrowser() {
  if (browserInstance && Date.now() - browserLastUsed > browserIdleTimeout) {
    try {
      await browserInstance.close();
    } catch {
      // Ignore browser cleanup errors.
    }

    browserInstance = null;
  }

  if (browserInstance && browserInstance.connected) {
    browserLastUsed = Date.now();
    return browserInstance;
  }

  const puppeteer = await import("puppeteer");

  browserInstance = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
    ],
  });
  browserLastUsed = Date.now();
  return browserInstance;
}

async function redeemWithBrowser(voucherCode: string, receiverPhone: string): Promise<TrueMoneyRedeemResult> {
  let page: PuppeteerPage | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    );

    await page.goto(`https://gift.truemoney.com/campaign/?v=${voucherCode}`, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    const result = await page.evaluate(
      async (url: string, mobile: string, hash: string) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mobile,
              voucher_hash: hash,
            }),
          });

          const statusCode = response.status;
          const payload = (await response.json().catch(() => null)) as TrueMoneyPayload | null;

          return { statusCode, payload };
        } catch (error) {
          return {
            statusCode: 0,
            payload: null,
            message: error instanceof Error ? error.message : "Browser redeem failed.",
          };
        }
      },
      `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`,
      receiverPhone,
      voucherCode,
    );

    if (result.message) {
      return {
        ok: false,
        statusCode: result.statusCode,
        message: result.message,
        payload: result.payload,
      };
    }

    return buildRedeemResult(result.statusCode, result.payload);
  } catch (error) {
    browserInstance = null;
    return {
      ok: false,
      statusCode: 0,
      message: error instanceof Error ? error.message : "Browser redeem failed.",
      payload: null,
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // Ignore page cleanup errors.
      }
    }
  }
}

export async function redeemTrueMoneyVoucher(
  voucherCode: string,
  receiverPhone: string,
): Promise<TrueMoneyRedeemResult> {
  const fetchResult = await redeemWithFetch(voucherCode, receiverPhone);

  if (fetchResult.ok || fetchResult.statusCode !== 403) {
    return fetchResult;
  }

  return redeemWithBrowser(voucherCode, receiverPhone);
}
