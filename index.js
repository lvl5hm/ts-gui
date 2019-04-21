var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
function resizeCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
}
window.onresize = function () { return resizeCanvas(canvas); };
resizeCanvas(canvas);
var mouseX = 0;
var mouseY = 0;
var mouseWentDown = false;
var mouseWentUp = false;
var mouseIsDown = false;
window.onmousemove = function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
};
window.onmousedown = function (e) {
    mouseWentDown = true;
    mouseIsDown = true;
};
window.onmouseup = function (e) {
    mouseWentUp = true;
    mouseIsDown = false;
};
function pointInCircle(x, y, cX, cY, r) {
    var dist = Math.sqrt(Math.pow((cX - x), 2) + Math.pow((cY - y), 2));
    var result = dist < r;
    return result;
}
function pointInRect(x, y, rX, rY, rW, rH) {
    var result = x > rX && x < (rX + rW) &&
        (y > rY) && (y < rY + rH);
    return result;
}
function roundedRect(ctx, x, y, width, height, radius) {
    if (width > 0 && height > 0) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
        ctx.lineTo(x + radius, y + height);
        ctx.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
        ctx.lineTo(x, y + radius);
        ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    }
}
function getZoom() {
    var result = window.devicePixelRatio;
    return result;
}
function fillRoundedRect(ctx, x, y, width, height, raduis, color) {
    ctx.beginPath();
    roundedRect(ctx, x, y, width, height, raduis);
    ctx.fillStyle = color;
    ctx.fill();
}
var SliderKind;
(function (SliderKind) {
    SliderKind[SliderKind["REGULAR"] = 0] = "REGULAR";
    SliderKind[SliderKind["TARIFF"] = 1] = "TARIFF";
})(SliderKind || (SliderKind = {}));
function drawSlider(ctx, slider, _a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height, kind = _a.kind, items = _a.items, min = _a.min, max = _a.max;
    var minPinX = 0;
    var maxPinX = 0;
    switch (kind) {
        case SliderKind.TARIFF:
            {
                var PIN_WIDTH = 4;
                console.assert(Boolean(items));
                var padding = width / (items.length + 2);
                minPinX = x + PIN_WIDTH + padding;
                maxPinX = minPinX + width - PIN_WIDTH * 2 - padding * 2;
                var maxPinDelta = maxPinX - minPinX;
                ctx.fillStyle = '#3e3d3f';
                ctx.fillRect(x, y, width, height);
                ctx.fillStyle = '#fecb23';
                ctx.fillRect(x, y, padding + maxPinDelta * slider.currentRatio + PIN_WIDTH, height);
                // draw pin
                var pinX = minPinX + slider.currentRatio * maxPinDelta;
                var pinY = y;
                ctx.fillStyle = '#fff';
                ctx.fillRect(pinX - PIN_WIDTH * 0.5, pinY, PIN_WIDTH, height);
                // draw arrows
                var ARROW_X = 7;
                var ARROW_W = 10;
                var ARROW_H = 18;
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pinX - ARROW_X, y + height - 25);
                ctx.lineTo(pinX - ARROW_X - ARROW_W, y + height - 25 - ARROW_H * 0.5);
                ctx.lineTo(pinX - ARROW_X, y + height - 25 - ARROW_H);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pinX + ARROW_X, y + height - 25);
                ctx.lineTo(pinX + ARROW_X + ARROW_W, y + height - 25 - ARROW_H * 0.5);
                ctx.lineTo(pinX + ARROW_X, y + height - 25 - ARROW_H);
                ctx.stroke();
                // draw transparent pin
                var SELECTABLE_WIDTH = 62;
                var SELECTABLE_HEIGHT = 205;
                fillRoundedRect(ctx, pinX - slider.currentSelectableWidth * 0.5, y + height * 0.5 - SELECTABLE_HEIGHT * 0.5, slider.currentSelectableWidth, SELECTABLE_HEIGHT, slider.currentSelectableWidth * 0.5, 'rgba(255, 255, 255, 0.26)');
                if (slider.isDragging) {
                    slider.currentSelectableWidth += (SELECTABLE_WIDTH - slider.currentSelectableWidth) / 5;
                }
                else {
                    slider.currentSelectableWidth *= 0.8;
                }
                // check pin collision
                if (mouseWentDown) {
                    slider.isDragging = pointInRect(mouseX, mouseY, pinX - SELECTABLE_WIDTH * 0.5, pinY, SELECTABLE_WIDTH, height);
                    slider.grabOffset = mouseX - pinX;
                }
            }
            break;
        case SliderKind.REGULAR:
            {
                var PIN_RADIUS = 12;
                var BG_RECT_RADIUS = 4;
                minPinX = x + PIN_RADIUS;
                maxPinX = minPinX + width - PIN_RADIUS * 2;
                var maxPinDelta = maxPinX - minPinX;
                fillRoundedRect(ctx, x, y, width, height, BG_RECT_RADIUS, '#EDEDED');
                fillRoundedRect(ctx, x, y, PIN_RADIUS + maxPinDelta * slider.currentRatio, height, BG_RECT_RADIUS, '#FFDC7D');
                // draw pin
                var pinX = minPinX + slider.currentRatio * maxPinDelta;
                var pinY = y + height * 0.5;
                ctx.beginPath();
                ctx.arc(pinX, pinY, PIN_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.strokeStyle = '#aaa';
                ctx.stroke();
                // check pin collision
                if (mouseWentDown) {
                    slider.isDragging = pointInCircle(mouseX, mouseY, pinX, pinY, PIN_RADIUS);
                    ;
                    slider.grabOffset = mouseX - pinX;
                }
            }
            break;
        default: console.assert(false);
    }
    if (mouseWentUp) {
        slider.isDragging = false;
    }
    var result = null;
    if (slider.isDragging) {
        slider.currentRatio = (mouseX - minPinX - slider.grabOffset) / (maxPinX - minPinX);
        slider.currentRatio = Math.min(Math.max(0, slider.currentRatio), 1);
    }
    else {
        slider.currentRatio += (slider.targetRatio - slider.currentRatio) / 4;
    }
    var roundedRatio = 0;
    if (items) {
        roundedRatio = Math.round(slider.currentRatio * (items.length - 1)) / (items.length - 1);
        var itemIndex = roundedRatio * (items.length - 1);
        result = items[itemIndex];
    }
    else {
        console.assert(min !== undefined && max !== undefined);
        var range = max - min;
        roundedRatio = Math.round(slider.currentRatio * range) / range;
        result = Math.round(roundedRatio * range);
    }
    if (roundedRatio !== slider.targetRatio) {
        slider.targetRatio = roundedRatio;
    }
    return result;
}
function drawLegend(ctx, x, y, width, items) {
    for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
        var item = items[itemIndex];
        ctx.fillStyle = '#000';
        var legendX = 12 + x + itemIndex / (items.length - 1) * width;
        var legendY = y;
        ctx.textAlign = 'center';
        ctx.font = '12px Arial';
        ctx.fillText(item.toString(), legendX, legendY);
    }
}
var slider = {
    isDragging: false,
    grabOffset: 0,
    currentRatio: 0,
    targetRatio: 0,
    currentSelectableWidth: 0
};
var ContentAlign;
(function (ContentAlign) {
    ContentAlign[ContentAlign["TOP"] = 0] = "TOP";
    ContentAlign[ContentAlign["CENTER"] = 1] = "CENTER";
    ContentAlign[ContentAlign["BOTTOM"] = 2] = "BOTTOM";
    ContentAlign[ContentAlign["STRETCH"] = 3] = "STRETCH";
    ContentAlign[ContentAlign["LEFT"] = 4] = "LEFT";
    ContentAlign[ContentAlign["RIGHT"] = 5] = "RIGHT";
})(ContentAlign || (ContentAlign = {}));
var CellKind;
(function (CellKind) {
    CellKind[CellKind["NONE"] = 0] = "NONE";
    CellKind[CellKind["IMAGE"] = 1] = "IMAGE";
    CellKind[CellKind["TEXT"] = 2] = "TEXT";
    CellKind[CellKind["GRID"] = 3] = "GRID";
    CellKind[CellKind["ARROW"] = 4] = "ARROW";
    CellKind[CellKind["SLIDER"] = 5] = "SLIDER";
})(CellKind || (CellKind = {}));
var ContentFlag;
(function (ContentFlag) {
    ContentFlag[ContentFlag["NONE"] = 0] = "NONE";
    ContentFlag[ContentFlag["EXPAND"] = 1] = "EXPAND";
    ContentFlag[ContentFlag["SHRINK"] = 2] = "SHRINK";
})(ContentFlag || (ContentFlag = {}));
var loop = function () {
    ctx.save();
    ctx.scale(getZoom(), getZoom());
    // //ctx.fillStyle = '#efeeee';
    // ctx.fillStyle = '#fff';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // const items = [1, 2, 4, 8];
    // const selectedValue = drawSlider(ctx, slider, {
    //   x: 40, y: 40, width: 400,
    //   kind: SLIDER_KIND_REGULAR,
    //   height: 12,
    //   min: 0,
    //   max: 30,
    // });
    // // drawLegend(ctx, 40, 80, 400 - 12 * 2, items.filter((it, i) => (i % 2 == 0))); //
    // // console.log(selectedValue);
    var zoom = getZoom();
    ctx.clearRect(0, 0, canvas.width * zoom, canvas.height * zoom);
    var maxWidth = canvas.width / zoom;
    var maxHeight = canvas.height / zoom;
    var appGrid = beginGrid({
        cols: 1, rows: 1,
        preferedWidth: maxWidth,
        preferedHeight: maxHeight,
        flexFactorX: [1],
        flexFactorY: [1]
    });
    appGrid.cellWidth = maxWidth;
    appGrid.cellHeight = maxHeight;
    {
        drawHeader();
    }
    endGrid();
    // console.log(appGrid);
    renderCell(ctx, appGrid, 0, 0);
    ctx.restore();
    mouseWentDown = false;
    mouseWentUp = false;
    requestAnimationFrame(loop);
};
function makeRect(x, y, width, height) {
    var result = { x: x, y: y, width: width, height: height };
    return result;
}
function makeDefaultCell() {
    var result = {
        kind: CellKind.NONE,
        preferedHeight: 0,
        preferedWidth: 0,
        contentX: ContentFlag.NONE,
        contentY: ContentFlag.NONE,
        contentAlignX: ContentAlign.LEFT,
        contentAlignY: ContentAlign.TOP,
        cellWidth: 0,
        cellHeight: 0,
        contentWidth: 0,
        contentHeight: 0,
        minWidth: 0,
        minHeight: 0,
        maxWidth: Infinity,
        maxHeight: Infinity
    };
    return result;
}
var ARROW_WIDTH = 5;
var ARROW_HEIGHT = 10;
function rotateVector(x, y, angle) {
    var result = {
        x: x * Math.cos(angle) - y * Math.sin(angle),
        y: y * Math.cos(angle) - x * Math.sin(angle)
    };
    return result;
}
function getFontHeight(ctx) {
    var result = parseInt(ctx.font.match(/\d+/)[0], 10);
    return result;
}
function getMultilineHeight(ctx, text, maxWidth) {
    var words = text.split(' ');
    var fontHeight = getFontHeight(ctx);
    var lineWidth = ctx.measureText(words[0]).width;
    var lineCount = 1;
    for (var wordIndex = 1; wordIndex < words.length; wordIndex++) {
        var word = words[wordIndex];
        var wordLength = ctx.measureText(word).width;
        lineWidth += wordLength;
        if (lineWidth > maxWidth) {
            lineCount++;
            lineWidth = wordLength;
        }
    }
    var result = lineCount * fontHeight;
    return result;
}
function fillMultilineText(ctx, text, x, y, maxWidth) {
    var words = text.split(' ');
    var wordLengths = [];
    var fontHeight = getFontHeight(ctx);
    var lineWidth = ctx.measureText(words[0]).width;
    var lineCount = 1;
    wordLengths[0] = lineWidth;
    for (var wordIndex = 1; wordIndex < words.length; wordIndex++) {
        var word = words[wordIndex];
        var wordLength = ctx.measureText(word).width;
        wordLengths[wordIndex] = wordLength;
        lineWidth += wordLength;
        if (lineWidth > maxWidth) {
            lineCount++;
            lineWidth = wordLength;
        }
    }
    ctx.textBaseline = 'top';
    var drawX = x;
    var drawY = y - lineCount * fontHeight * 0.5;
    lineWidth = wordLengths[0];
    var line = words[0] + ' ';
    for (var wordIndex = 1; wordIndex < words.length; wordIndex++) {
        var word = words[wordIndex];
        var wordLength = wordLengths[wordIndex];
        lineWidth += wordLength;
        if (lineWidth > maxWidth) {
            ctx.fillText(line, drawX, drawY);
            lineWidth = wordLength;
            line = word;
            drawY += fontHeight;
        }
        else {
            line += word;
        }
        if (wordIndex !== words.length - 1) {
            line += ' ';
        }
    }
    ctx.fillText(line, drawX, drawY);
}
function calcCell(item) {
    switch (item.kind) {
        case CellKind.GRID:
            {
                for (var cellIndex = 0; cellIndex < item.cells.length; cellIndex++) {
                    var gridY = Math.floor(cellIndex / item.cols);
                    var gridX = cellIndex - gridY;
                    var childCell = item.cells[cellIndex];
                    calcCell(childCell);
                    var bandX = item.bandsX[gridX];
                    var bandY = item.bandsY[gridY];
                    if (childCell.contentWidth > bandX.size) {
                        bandX.size = childCell.contentWidth;
                    }
                    if (childCell.contentHeight > bandY.size) {
                        bandY.size = childCell.contentHeight;
                    }
                }
                var totalWidth = 0;
                var totalHeight = 0;
                for (var i = 0; i < item.bandsX.length; i++) {
                    totalWidth += item.bandsX[i].size;
                }
                for (var i = 0; i < item.bandsY.length; i++) {
                    totalHeight += item.bandsY[i].size;
                }
                var width = item.preferedWidth || totalWidth;
                var height = item.preferedHeight || totalHeight;
                item.contentWidth = width;
                item.contentHeight = height;
                item.sumOfCellsWidth = totalWidth;
                item.sumOfCellsHeight = totalHeight;
                for (var i = 0; i < item.cells.length; i++) {
                    var gridY = Math.floor(i / item.cols);
                    var gridX = i - gridY;
                    var cell = item.cells[i];
                    var width_1 = item.bandsX[gridX].size;
                    var height_1 = item.bandsY[gridY].size;
                    cell.cellWidth = width_1;
                    cell.cellHeight = height_1;
                }
            }
            break;
        case CellKind.ARROW:
            {
                var _a = rotateVector(ARROW_WIDTH, ARROW_HEIGHT, item.angle), x = _a.x, y = _a.y;
                item.contentWidth = x;
                item.contentHeight = y;
            }
            break;
        case CellKind.TEXT:
            {
                ctx.font = item.font;
                var width = item.preferedWidth || ctx.measureText(item.text).width;
                var height = item.preferedHeight || getMultilineHeight(ctx, item.text, width);
                item.contentWidth = width;
                item.contentHeight = height;
            }
            break;
        case CellKind.IMAGE:
            {
                item.contentWidth = item.preferedWidth || item.image.width;
                item.contentHeight = item.preferedHeight || item.image.height;
            }
            break;
        case CellKind.SLIDER:
            {
                item.contentHeight = item.preferedHeight || item.sliderParams.height;
                item.contentWidth = item.preferedWidth || item.sliderParams.width;
            }
            break;
        default: console.assert(false);
    }
}
function drawCell(ctx, item, cellX, cellY) {
    var contentX = cellX;
    var contentY = cellY;
    switch (item.contentX) {
        case ContentFlag.NONE: break;
        case ContentFlag.EXPAND:
            {
                item.contentWidth = item.cellWidth;
            }
            break;
        case ContentFlag.SHRINK:
            {
                if (item.contentWidth > item.cellWidth) {
                    item.contentWidth = item.cellWidth;
                }
            }
            break;
        default: console.assert(false);
    }
    switch (item.contentY) {
        case ContentFlag.NONE: break;
        case ContentFlag.EXPAND:
            {
                item.contentHeight = item.cellHeight;
            }
            break;
        case ContentFlag.SHRINK:
            {
                if (item.contentHeight > item.cellHeight) {
                    item.contentHeight = item.cellHeight;
                }
            }
            break;
        default: console.assert(false);
    }
    if (item.contentAlignX !== undefined) {
        switch (item.contentAlignX) {
            case ContentAlign.LEFT: break;
            case ContentAlign.CENTER:
                contentX = cellX + item.cellWidth * 0.5 - item.contentWidth * 0.5;
                break;
            case ContentAlign.RIGHT:
                contentX = cellX + item.cellWidth - item.contentWidth;
                break;
            default: console.assert(false);
        }
    }
    if (item.contentAlignY !== undefined) {
        switch (item.contentAlignY) {
            case ContentAlign.TOP: break;
            case ContentAlign.CENTER:
                contentY = cellY + item.cellHeight * 0.5 - item.contentHeight * 0.5;
                break;
            case ContentAlign.BOTTOM:
                contentY = cellY + item.cellHeight - item.contentHeight;
                break;
            default: console.assert(false);
        }
    }
    ctx.strokeStyle = "rgb(100, 200, 100)";
    ctx.lineWidth = 2;
    ctx.strokeRect(cellX, cellY, item.cellWidth, item.cellHeight);
    switch (item.kind) {
        case CellKind.GRID:
            {
                var childX = contentX;
                var childY = contentY;
                var spaceLeftX = item.contentWidth - item.sumOfCellsWidth;
                if (spaceLeftX) {
                    for (var x = 0; x < item.bandsX.length; x++) {
                        var bandX = item.bandsX[x];
                        if (Math.sign(bandX.flexFactor) === Math.sign(spaceLeftX)) {
                            var ratio = bandX.flexFactor / item.totalFlexFactorPosX;
                            bandX.size += ratio * spaceLeftX;
                        }
                    }
                }
                // let spaceLeftY = item.contentHeight - item.sumOfCellsHeight;
                // for (let y = 0; y < item.bandsY.length; y++) {
                //   const bandY = item.bandsY[y];
                //   if (bandY.flag === CellFlag.EXPAND) {
                //     const spaceAdded = spaceLeftY / item.totalItemsWithGrowY;
                //     for (let cellIndex = 0; cellIndex < item.cols; cellIndex++) {
                //       const cell = item.cells[y * item.cols + cellIndex];
                //       cell.cellHeight += spaceAdded;
                //     }
                //   }
                //   if (bandY.flag === CellFlag.SHRINK) {
                //     const spaceRemoved = spaceLeftY / item.totalItemsWithShrinkY;
                //     for (let cellIndex = 0; cellIndex < item.rows; cellIndex++) {
                //       const cell = item.cells[y * item.cols + cellIndex];
                //       cell.cellWidth += spaceRemoved;
                //     }
                //   }
                // }
                for (var cellIndex = 0; cellIndex < item.cells.length; cellIndex++) {
                    var cell = item.cells[cellIndex];
                    var gridY = Math.floor(cellIndex / item.cols);
                    var gridX = cellIndex - gridY;
                    drawCell(ctx, cell, childX, childY);
                    if (gridX === item.cols - 1) {
                        childY += cell.cellHeight;
                        childX = contentX;
                    }
                    else {
                        childX += cell.cellWidth;
                    }
                }
            }
            break;
        case CellKind.ARROW:
            {
                ctx.save();
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.translate(contentX + item.contentWidth * 0.5, contentY + item.contentY * 0.5);
                ctx.rotate(-item.angle);
                ctx.moveTo(-ARROW_WIDTH * 0.5, -ARROW_HEIGHT * 0.5);
                ctx.lineTo(ARROW_WIDTH * 0.5, 0);
                ctx.lineTo(-ARROW_WIDTH * 0.5, ARROW_HEIGHT * 0.5);
                ctx.stroke();
                ctx.restore();
            }
            break;
        case CellKind.TEXT:
            {
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = '#000';
                if (item.font) {
                    ctx.font = item.font;
                }
                fillMultilineText(ctx, item.text, contentX + item.contentWidth * 0.5, contentY + item.contentHeight * 0.5, item.contentWidth);
                // ctx.fillText(item.text, contentX + item.contentWidth * 0.5, contentY + item.contentHeight * 0.5);
            }
            break;
        case CellKind.IMAGE:
            {
                ctx.drawImage(item.image, contentX, contentY, item.contentWidth, item.contentHeight);
            }
            break;
        case CellKind.SLIDER:
            {
                drawSlider(ctx, item.state, __assign({}, item.sliderParams, { x: contentX, y: contentY, width: item.contentWidth, height: item.contentHeight }));
            }
            break;
        default: console.assert(false);
    }
}
function renderCell(ctx, cell, x, y) {
    // calculate the dimensions
    calcCell(cell);
    // render on the canvas
    drawCell(ctx, cell, x, y);
}
function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}
var imgHeader = loadImage('https://static.beeline.ru/upload/images/business/logo.svg');
var state = {
    gridStack: []
};
function peek(arr) {
    console.assert(arr.length > 0);
    var result = arr[arr.length - 1];
    return result;
}
function pushCell(cell) {
    var grid = peek(state.gridStack);
    console.assert(grid.cells.length < grid.cols * grid.rows);
    grid.cells.push(cell);
    return cell;
}
function clone(thing) {
    if (Array.isArray(thing)) {
        return thing.slice();
    }
    if (thing && typeof thing === 'object') {
        var result = {};
        for (var key in thing) {
            result[key] = clone(thing[key]);
        }
        return result;
    }
    return thing;
}
function makeArrayOfCopies(item, count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(clone(item));
    }
    return result;
}
function beginGrid(params) {
    var grid = __assign({}, makeDefaultCell(), { kind: CellKind.GRID }, params, { cells: [], bandsX: makeArrayOfCopies({ size: 0, flexFactor: 0 }, params.cols), bandsY: makeArrayOfCopies({ size: 0, flexFactor: 0 }, params.rows), sumOfCellsWidth: 0, sumOfCellsHeight: 0, totalFlexFactorPosX: 0, totalFlexFactorNegX: 0, totalFlexFactorPosY: 0, totalFlexFactorNegY: 0 });
    if (params.flexFactorX) {
        for (var x = 0; x < params.flexFactorX.length; x++) {
            var f = params.flexFactorX[x];
            grid.bandsX[x].flexFactor = f;
            if (f > 0) {
                grid.totalFlexFactorPosX += f;
            }
            else {
                grid.totalFlexFactorNegX += f;
            }
        }
    }
    if (params.flexFactorY) {
        for (var y = 0; y < params.flexFactorY.length; y++) {
            var f = params.flexFactorY[y];
            grid.bandsX[y].flexFactor = f;
            if (f > 0) {
                grid.totalFlexFactorPosY += f;
            }
            else {
                grid.totalFlexFactorNegY += f;
            }
        }
    }
    if (state.gridStack.length) {
        var parentGrid = peek(state.gridStack);
        parentGrid.cells.push(grid);
    }
    state.gridStack.push(grid);
    return grid;
}
function cellDrawImage(params) {
    var parentGrid = peek(state.gridStack);
    var image = __assign({}, makeDefaultCell(), { kind: CellKind.IMAGE }, params);
    parentGrid.cells.push(image);
}
function cellDrawText(params) {
    var parentGrid = peek(state.gridStack);
    var image = __assign({}, makeDefaultCell(), { kind: CellKind.TEXT }, params);
    parentGrid.cells.push(image);
}
function cellDrawArrow(params) {
    var parentGrid = peek(state.gridStack);
    var arrow = __assign({}, makeDefaultCell(), { kind: CellKind.ARROW }, params);
    parentGrid.cells.push(arrow);
}
function cellDrawSlider(params) {
    var parentGrid = peek(state.gridStack);
    var arrow = __assign({}, makeDefaultCell(), { kind: CellKind.SLIDER }, params);
    parentGrid.cells.push(arrow);
}
function endGrid() {
    state.gridStack.pop();
}
function makeDim() {
    var result = {
        min: 0,
        max: 0,
        preferred: 0,
        reported: 0
    };
    return result;
}
function repeatArray(arr, times) {
    var result = [];
    for (var i = 0; i < times; i++) {
        for (var j = 0; j < arr.length; j++) {
            result.push(arr[j]);
        }
    }
    return result;
}
function drawHeader() {
    var mainMenuItems = [
        'Мобильная связь',
        'Фиксированная связь',
        'Продукты и решения',
        'Крупный бизнес',
        'Блог',
    ];
    beginGrid({
        cols: 2, rows: 1,
        preferedHeight: 70,
        preferedWidth: 1140,
        contentAlignX: ContentAlign.CENTER,
        contentX: ContentFlag.SHRINK,
        flexFactorX: [0, 1]
    });
    {
        cellDrawImage({
            image: imgHeader,
            preferedHeight: 40,
            preferedWidth: imgHeader.width * 40 / imgHeader.height,
            contentAlignY: ContentAlign.CENTER
        });
        beginGrid({
            cols: 10, rows: 1,
            contentY: ContentFlag.EXPAND,
            contentAlignX: ContentAlign.CENTER,
            contentX: ContentFlag.SHRINK,
            flexFactorX: repeatArray([-1, 0], mainMenuItems.length),
            flexMinWidth: repeatArray([30, 0], mainMenuItems.length),
            flexFactorY: [1]
        });
        {
            // draw menu item
            for (var i = 0; i < mainMenuItems.length; i++) {
                cellDrawText({
                    text: mainMenuItems[i], font: '14px Arial',
                    contentAlignY: ContentAlign.CENTER,
                    contentX: ContentFlag.SHRINK,
                    minWidth: 30
                });
                cellDrawArrow({
                    angle: -Math.PI * 0.5,
                    contentAlignY: ContentAlign.CENTER
                });
            }
        }
        endGrid();
    }
    endGrid();
}
requestAnimationFrame(loop);
