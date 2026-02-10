import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "simble1498.be23@chitkarauniversity.edu.in";
const GEMINI_API_KEY = "AIzaSyBEoj6ez4uT6J1QuG5NQ8bKUpCZ3X3IWxQ";


function fibonacci(n) {
    if (n < 0) throw new Error();
    let a = 0, b = 1;
    let res = [];
    for (let i = 0; i < n; i++) {
        res.push(a);
        [a, b] = [b, a + b];
    }
    return res;
}


function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}


function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}


function lcmArray(arr) {
    let res = arr[0];
    for (let i = 1; i < arr.length; i++) {
        res = (res * arr[i]) / gcd(res, arr[i]);
    }
    return res;
}


function hcfArray(arr) {
    let res = arr[0];
    for (let i = 1; i < arr.length; i++) {
        res = gcd(res, arr[i]);
    }
    return res;
}


async function askAI(question) {
    if (!GEMINI_API_KEY) throw new Error("Missing API Key");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
        contents: [
            {
                parts: [
                    { text: question }
                ]
            }
        ]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("AI Failed");

    const data = await response.json();

    return data.candidates[0].content.parts[0].text
        .trim()
        .split(" ")[0];
}


app.get("/health", (req, res) => {
    res.json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});


app.post("/bfhl", async (req, res) => {

    const body = req.body;

    if (!body || typeof body !== "object") {
        return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
        });
    }

    const keys = Object.keys(body);

    if (keys.length !== 1) {
        return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
        });
    }

    const key = keys[0];
    const val = body[key];

    try {

        let data;

        if (key === "fibonacci") {

            if (!Number.isInteger(val)) throw new Error();
            data = fibonacci(val);

        } else if (key === "prime") {

            if (!Array.isArray(val)) throw new Error();
            data = val.filter(x => Number.isInteger(x) && isPrime(x));

        } else if (key === "lcm") {

            if (!Array.isArray(val) || val.length === 0) throw new Error();
            data = lcmArray(val);

        } else if (key === "hcf") {

            if (!Array.isArray(val) || val.length === 0) throw new Error();
            data = hcfArray(val);

        } else if (key === "AI") {

            if (typeof val !== "string") throw new Error();
            data = await askAI(val);

        } else {
            throw new Error();
        }


        res.json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: data
        });

    } catch {

        res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
        });

    }

});


app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});