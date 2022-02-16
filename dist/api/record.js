"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const baseURL = 'http://jm-expense-mysql.herokuapp.com';
const apiHelper = axios_1.default.create({
    baseURL
});
exports.default = {
    getRecords() {
        return apiHelper.get('/record/all');
    }
};