// Thong diep loi cho cac lenh dong lenh (migrate, seed, reset, token): kem nguyen nhan goc neu loi da duoc boc
// (vd DataAccessError boc loi ECONNREFUSED) de nguoi chay biet sua o dau.
module.exports = (err) => (err.cause && err.cause.message ? `${err.message} (${err.cause.message})` : err.message);
