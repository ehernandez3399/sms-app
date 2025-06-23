const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

async function sendSms(to, body, from = process.env.VONAGE_FROM_NUMBER) {
  return new Promise((resolve, reject) => {
    vonage.sms.send(
      { to, from, text: body },
      (err, responseData) => {
        if (err) return reject(err);
        if (responseData.messages[0].status !== "0") {
          return reject(new Error(`Vonage SMS error: ${responseData.messages[0]['error-text']}`));
        }
        resolve(responseData);
      }
    );
  });
}

module.exports = { sendSms };
