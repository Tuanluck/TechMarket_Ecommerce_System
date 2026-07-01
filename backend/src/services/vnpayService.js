const crypto = require('crypto');
const qs = require('qs');

/**
 * Format Date to YYYYMMDDHHmmss in GMT+7
 */
function getVnpayDateFormat(date) {
    const pad = (num) => String(num).padStart(2, '0');
    
    // Convert to GMT+7 (Vietnam Time)
    // Date object is in UTC or local server time, let's compute GMT+7 representation
    const tzOffset = 7 * 60; // GMT+7 in minutes
    const localTime = date.getTime() + (date.getTimezoneOffset() + tzOffset) * 60000;
    const gmt7Date = new Date(localTime);

    const year = gmt7Date.getFullYear();
    const month = pad(gmt7Date.getMonth() + 1);
    const day = pad(gmt7Date.getDate());
    const hour = pad(gmt7Date.getHours());
    const minute = pad(gmt7Date.getMinutes());
    const second = pad(gmt7Date.getSeconds());

    return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Sorts object keys alphabetically
 */
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

const createPaymentUrl = (order, ipAddr) => {
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const date = new Date();
    const createDate = getVnpayDateFormat(date);

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = order.orderCode;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${order.orderCode}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = order.finalAmount * 100; // VNPay requires multiplying by 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = secureHash;
    
    // For V2.1.0, parameters in query must be URL-encoded
    const queryStr = qs.stringify(vnp_Params, { encode: true });
    return `${vnpUrl}?${queryStr}`;
};

const verifyReturnUrl = (queryParams) => {
    const secureHash = queryParams['vnp_SecureHash'];
    const secretKey = process.env.VNP_HASH_SECRET;

    // Remove hash and hash type before validating
    let vnp_Params = { ...queryParams };
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
        return {
            isValid: true,
            orderCode: queryParams['vnp_TxnRef'],
            responseCode: queryParams['vnp_ResponseCode'], // '00' is success
            transactionStatus: queryParams['vnp_TransactionStatus'], // '00' is success
            amount: parseFloat(queryParams['vnp_Amount']) / 100,
            bankCode: queryParams['vnp_BankCode'],
            vnpayTranId: queryParams['vnp_TransactionNo']
        };
    }

    return { isValid: false };
};

module.exports = {
    createPaymentUrl,
    verifyReturnUrl
};
