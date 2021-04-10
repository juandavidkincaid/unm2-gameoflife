
const base64Encode = (tenc: any) => {
    return btoa(tenc);
}

const base64Decode = (tdec: string) => {
    return atob(tdec);
}

const base64EncodeUrl = (tenc: any) => {
    return base64Encode(tenc).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const base64DecodeUrl = (tdec: string) => {
    return base64Encode(tdec.replace(/-/g, '+').replace(/_/g, '/'));
}

export {
    base64Encode,
    base64Decode,
    base64EncodeUrl,
    base64DecodeUrl,
    base64Encode as b64enc,
    base64Decode as b64dec,
    base64EncodeUrl as b64encu,
    base64DecodeUrl as b64decu,
}