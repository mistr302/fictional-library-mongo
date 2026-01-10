"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookRouter = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.bookRouter = router;
router.get('/', (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
router.post('/', (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
router.put('/:id', (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
router.delete('/:id', (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
});
//# sourceMappingURL=bookRoutes.js.map