"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanRouter = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.loanRouter = router;
router.post('/', (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
router.post('/:id/return', (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
//# sourceMappingURL=loanRoutes.js.map