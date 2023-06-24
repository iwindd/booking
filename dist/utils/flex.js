"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flex = void 0;
const createMetadata = (metadata) => {
    if (metadata.style == "list") {
        return {
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [
                {
                    "type": "text",
                    "text": metadata.label,
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": !metadata.scale ? 1 : metadata.scale[0]
                },
                {
                    "type": "text",
                    "text": metadata.value,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": !metadata.scale ? 5 : metadata.scale[1]
                }
            ]
        };
    }
    else if (metadata.style == "button") {
        return {
            "type": "button",
            "style": "primary",
            "margin": "md",
            "action": Object.assign({ "label": metadata.label }, (metadata.action)),
        };
    }
    else if (metadata.style == "confirmation") {
        return {
            "type": "box",
            "layout": "horizontal",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": Object.assign({ "label": metadata.confirmLabel || "ตกลง" }, (metadata.confirm))
                },
                {
                    "type": "button",
                    "height": "sm",
                    "action": Object.assign({ "label": metadata.cancelLabel || "ยกเลิก" }, (metadata.cancel)),
                    "style": "secondary"
                }
            ],
            "spacing": "sm",
            "margin": "md"
        };
    }
};
const createItem = (item) => {
    const elements = [];
    item.metadata.map((metadata) => {
        elements.push(createMetadata(metadata));
    });
    return Object.assign({ "type": "box", "layout": "vertical", "contents": [
            {
                "type": "text",
                "text": item.title,
                "weight": "bold",
                "align": item.align || "start",
                "size": "xl"
            },
            {
                "type": "box",
                "layout": "vertical",
                "margin": "lg",
                "spacing": "sm",
                "contents": elements
            }
        ] }, (!item.onClick ? {} : {
        "action": item.onClick
    }));
};
class flex {
    constructor(title = "untitled") {
        this.title = "untitled";
        this.items = [];
        this.align = "start";
        this.title = title;
    }
    setTitle(title) {
        this.title = title;
    }
    setTitleAlign(align) {
        this.align = align;
    }
    add(item) {
        this.items.push(item);
    }
    isEmpty() {
        return this.items.length <= 0;
    }
    render() {
        const elements = [];
        this.items.map((item, index) => {
            elements.push(createItem(item));
            if (index < this.items.length - 1) {
                elements.push({
                    "type": "separator",
                    "margin": "lg"
                });
            }
        });
        const container = {
            type: "flex",
            altText: this.title,
            contents: {
                type: "bubble",
                header: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            "type": "text",
                            "text": this.title,
                            "weight": "bold",
                            "align": this.align,
                            "wrap": true,
                            "size": "xxl"
                        }
                    ]
                },
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: elements,
                    spacing: "lg"
                }
            }
        };
        return container;
    }
}
exports.flex = flex;
