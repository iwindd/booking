"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class useMessage {
    constructor(state = false) {
        this.state = false;
        this.attributes = [];
        this.state = state;
    }
    set(state) {
        this.state = state;
    }
    add(attributeName, data) {
        this.attributes.push({ key: attributeName, val: data });
    }
    get() {
        let data = {
            status: !this.state ? "error" : "success",
        };
        this.attributes.map((attribute) => {
            data[attribute.key] = attribute.val;
        });
        return data;
    }
}
exports.default = useMessage;
