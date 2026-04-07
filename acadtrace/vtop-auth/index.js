import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { createCanvas, loadImage } from "canvas";
import { bitmaps } from "./bitmaps.js";
import { URLSearchParams } from "url";

const app = express();
app.use(express.json());

// Enable CORS without requiring the 'cors' package
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        return res.status(200).json({});
    }
    next();
});

const agent = new https.Agent({ rejectUnauthorized: false });

const getImageBlocks = (pixelData) => {
    const saturate = new Array(pixelData.length / 4);
    for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i], g = pixelData[i + 1], b = pixelData[i + 2];
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        saturate[i / 4] = max === 0 ? 0 : Math.round(((max - min) * 255) / max);
    }

    const img = [];
    for (let i = 0; i < 40; i++) {
        img[i] = [];
        for (let j = 0; j < 200; j++) {
            img[i][j] = saturate[i * 200 + j];
        }
    }

    const blocks = new Array(6);
    for (let i = 0; i < 6; i++) {
        const x1 = (i + 1) * 25 + 2;
        const y1 = 7 + 5 * (i % 2) + 1;
        const x2 = (i + 2) * 25 + 1;
        const y2 = 35 - 5 * ((i + 1) % 2);
        blocks[i] = img.slice(y1, y2).map(row => row.slice(x1, x2));
    }
    return blocks;
};

const binarizeImage = (charImg) => {
    let avg = 0;
    charImg.forEach(row => row.forEach(pixel => (avg += pixel)));
    avg /= charImg.length * charImg[0].length;
    const bits = new Array(charImg.length);
    for (let i = 0; i < charImg.length; i++) {
        bits[i] = new Array(charImg[0].length);
        for (let j = 0; j < charImg[0].length; j++) {
            bits[i][j] = charImg[i][j] > avg ? 1 : 0;
        }
    }
    return bits;
};

const flatten = (matrix) => [].concat(...matrix);

const matMul = (a, b) => {
    const x = a.length, z = a[0].length, y = b[0].length;
    const product = Array(x).fill(0).map(() => Array(y).fill(0));
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            for (let k = 0; k < z; k++) {
                product[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return product;
};

const matAdd = (a, b) => a.map((val, i) => val + b[i]);

const softmax = (vec) => {
    const exps = vec.map(x => Math.exp(x));
    const sumExps = exps.reduce((a, b) => a + b);
    return exps.map(e => e / sumExps);
};

async function solveCaptcha(buffer) {
    const LABEL_TEXT = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    if (!bitmaps || !bitmaps.weights || !bitmaps.biases) {
        throw new Error("bitmaps.js could not be loaded or is missing weights/biases.");
    }
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const charBlocks = getImageBlocks(pixelData);
    let result = '';
    for (const block of charBlocks) {
        let inputVector = binarizeImage(block);
        inputVector = [flatten(inputVector)];
        let output = matMul(inputVector, bitmaps.weights);
        output = matAdd(output[0], bitmaps.biases);
        const probabilities = softmax(output);
        const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
        result += LABEL_TEXT[maxProbIndex];
    }
    return result;
}

async function getCaptchaImage($, cookies, client) {
    const imgSrc = $('#captchaBlock img').attr('src');
    if (!imgSrc) throw new Error("Captcha not found!");
    let buffer;
    if (imgSrc.startsWith("data:image")) {
        buffer = Buffer.from(imgSrc.split(",")[1], "base64");
    } else {
        const res = await client.get(imgSrc, {
            responseType: "arraybuffer",
            headers: { Cookie: cookies.join("; ") },
        });
        buffer = Buffer.from(res.data, "binary");
    }
    return buffer;
}

async function fetchDetails(cookies, dashboardHtml, client) {
    const $ = cheerio.load(dashboardHtml);
    const csrf = $('input[name="_csrf"]').val();
    const authorizedID = $('#authorizedID').val();
    if (!csrf || !authorizedID) throw new Error("Cannot find _csrf or authorizedID");

    const res = await client.post(
        "/vtop/studentsRecord/StudentProfileAllView",
        new URLSearchParams({ verifyMenu: "true", authorizedID, _csrf: csrf, nocache: Date.now().toString() }).toString(),
        {
            headers: {
                Cookie: cookies,
                "Content-Type": "application/x-www-form-urlencoded",
                Referer: "https://vtopcc.vit.ac.in/vtop/open/page",
            },
        }
    );

    const $profile = cheerio.load(res.data);
    const studentData = {};
    $profile('table tr').each((_, row) => {
        const columns = $profile(row).find('td');
        if (columns.length >= 2) {
            for (let i = 0; i < columns.length; i += 2) {
                let key = $profile(columns[i]).text().trim().split('\n')[0].replace(/:$/, '').trim();
                let value = $profile(columns[i + 1]).text().trim();
                if (key && value && key.length < 100) {
                    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    if (normalizedKey) studentData[normalizedKey] = value;
                }
            }
        }
    });
    return studentData;
}

async function performLogin(username, password) {
    const client = axios.create({
        baseURL: "https://vtopcc.vit.ac.in",
        httpsAgent: agent,
        withCredentials: true,
    });

    const res = await client.get("/vtop/prelogin/setup");
    let allCookies = [...(res.headers["set-cookie"] || [])];
    const $ = cheerio.load(res.data);
    const csrf = $("#stdForm input[name=_csrf]").val();
    if (!csrf) throw new Error("CSRF token not found");

    // 1. POST Setup
    const setupRes = await client.post(
        "/vtop/prelogin/setup",
        new URLSearchParams({ _csrf: csrf, flag: "VTOP" }),
        { headers: { Cookie: allCookies.join("; "), "Content-Type": "application/x-www-form-urlencoded" } }
    );
    if (setupRes.headers["set-cookie"]) allCookies = [...allCookies, ...setupRes.headers["set-cookie"]];

    // 2. GET Login Page
    const loginPage = await client.get("/vtop/login", { headers: { Cookie: allCookies.join("; ") } });
    if (loginPage.headers["set-cookie"]) allCookies = [...allCookies, ...loginPage.headers["set-cookie"]];
    
    const $$ = cheerio.load(loginPage.data);
    const csrfLogin = $$("input[name=_csrf]").val();
    
    const captchaBuffer = await getCaptchaImage($$, allCookies, client);
    const captchaText = await solveCaptcha(captchaBuffer);

    // 3. POST Login
    const loginRes = await client.post(
        "/vtop/login",
        new URLSearchParams({ _csrf: csrfLogin, username, password, captchaStr: captchaText }),
        {
            headers: { Cookie: allCookies.join("; "), "Content-Type": "application/x-www-form-urlencoded" },
            maxRedirects: 0,
            validateStatus: (s) => s < 400 || s === 302,
        }
    );

    if (loginRes.headers["set-cookie"]) allCookies = [...allCookies, ...loginRes.headers["set-cookie"]];
    const cookieString = allCookies.join("; ");

    let dashboardRes;
    if (loginRes.status === 302 && loginRes.headers.location) {
        const dest = loginRes.headers.location;
        dashboardRes = await client.get(dest, { headers: { Cookie: cookieString } });
    } else {
        dashboardRes = await client.get("/vtop/open/page", { headers: { Cookie: cookieString } });
    }

    const html = dashboardRes.data.toLowerCase();
    if (html.includes("authorizedidx")) {
        const studentData = await fetchDetails(cookieString, dashboardRes.data, client);
        return { success: true, data: studentData };
    } else {
        console.log("VTOP Handshake Diverged. Status:", loginRes.status, "Location:", loginRes.headers.location);
        
        let errorMessage = "Unknown login error";
        if (html.includes("invalid captcha")) errorMessage = "Invalid Captcha";
        else if (html.includes("invalid user name") || html.includes("invalid password")) errorMessage = "Invalid Credentials";
        else if (html.includes("locked")) errorMessage = "Account Locked";
        
        // If we were redirected to /error, try to fetch the specific message
        if (loginRes.headers.location === "/vtop/login/error") {
            const errorPage = await client.get("/vtop/login/error", { headers: { Cookie: cookieString } });
            const $err = cheerio.load(errorPage.data);
            const detail = $err(".alert-danger, .error-message, b").text().trim();
            if (detail) errorMessage = detail;
        }

        return { success: false, error: errorMessage };
    }
}

app.post("/fetch", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, error: "Missing username or password" });
    }
    try {
        const result = await performLogin(username, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`VTOP-Auth Server anchoring on port ${PORT}`);
});