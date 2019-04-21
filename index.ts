const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

function resizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
}

window.onresize = () => resizeCanvas(canvas);
resizeCanvas(canvas);

let mouseX = 0;
let mouseY = 0;
let mouseWentDown = false;
let mouseWentUp = false;
let mouseIsDown = false;

window.onmousemove = (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
};

window.onmousedown = (e) => {
  mouseWentDown = true;
  mouseIsDown = true;
};

window.onmouseup = (e) => {
  mouseWentUp = true;
  mouseIsDown = false;
};

function pointInCircle(x: number, y: number, cX: number, cY: number, r: number) {
  const dist = Math.sqrt((cX - x) ** 2 + (cY - y) ** 2);
  const result = dist < r;
  return result;
}

function pointInRect(x: number, y: number, rX: number, rY: number, rW: number, rH: number) {
  const result = x > rX && x < (rX + rW) &&
    (y > rY) && (y < rY + rH);
  return result;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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
  const result = window.devicePixelRatio;
  return result;
}





function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, raduis: number, color: string) {
  ctx.beginPath();
  roundedRect(ctx, x, y, width, height, raduis);
  ctx.fillStyle = color;
  ctx.fill();
}

enum SliderKind {
  REGULAR,
  TARIFF,
}


interface SliderState {
  isDragging: boolean;
  grabOffset: number;
  currentRatio: number;
  targetRatio: number;
  currentSelectableWidth: number;
}

interface SliderParams {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: SliderKind
  items?: number[];
  min?: number;
  max?: number;
}

function drawSlider(
  ctx: CanvasRenderingContext2D,
  slider: SliderState, {
    x, y, width, height,
    kind,
    items,
    min, max,
  }: SliderParams,
) {
  let minPinX = 0;
  let maxPinX = 0;

  switch (kind) {
    case SliderKind.TARIFF: {
      const PIN_WIDTH = 4;

      console.assert(Boolean(items));
      const padding = width / (items.length + 2);
      minPinX = x + PIN_WIDTH + padding;
      maxPinX = minPinX + width - PIN_WIDTH * 2 - padding * 2;
      const maxPinDelta = maxPinX - minPinX;

      ctx.fillStyle = '#3e3d3f';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#fecb23';
      ctx.fillRect(x, y, padding + maxPinDelta * slider.currentRatio + PIN_WIDTH, height);

      // draw pin
      const pinX = minPinX + slider.currentRatio * maxPinDelta;
      const pinY = y;

      ctx.fillStyle = '#fff';
      ctx.fillRect(pinX - PIN_WIDTH * 0.5, pinY, PIN_WIDTH, height);

      // draw arrows
      const ARROW_X = 7;
      const ARROW_W = 10;
      const ARROW_H = 18;
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
      const SELECTABLE_WIDTH = 62;
      const SELECTABLE_HEIGHT = 205;

      fillRoundedRect(
        ctx,
        pinX - slider.currentSelectableWidth * 0.5,
        y + height * 0.5 - SELECTABLE_HEIGHT * 0.5,
        slider.currentSelectableWidth, SELECTABLE_HEIGHT,
        slider.currentSelectableWidth * 0.5, 'rgba(255, 255, 255, 0.26)',
      );

      if (slider.isDragging) {
        slider.currentSelectableWidth += (SELECTABLE_WIDTH - slider.currentSelectableWidth) / 5;
      } else {
        slider.currentSelectableWidth *= 0.8;
      }

      // check pin collision
      if (mouseWentDown) {
        slider.isDragging = pointInRect(mouseX, mouseY, pinX - SELECTABLE_WIDTH * 0.5, pinY, SELECTABLE_WIDTH, height);
        slider.grabOffset = mouseX - pinX;
      }
    } break;

    case SliderKind.REGULAR: {
      const PIN_RADIUS = 12;
      const BG_RECT_RADIUS = 4;

      minPinX = x + PIN_RADIUS;
      maxPinX = minPinX + width - PIN_RADIUS * 2;
      const maxPinDelta = maxPinX - minPinX;

      fillRoundedRect(ctx, x, y, width, height, BG_RECT_RADIUS, '#EDEDED');
      fillRoundedRect(ctx, x, y, PIN_RADIUS + maxPinDelta * slider.currentRatio, height, BG_RECT_RADIUS, '#FFDC7D');

      // draw pin
      const pinX = minPinX + slider.currentRatio * maxPinDelta;
      const pinY = y + height * 0.5;

      ctx.beginPath();
      ctx.arc(pinX, pinY, PIN_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#aaa';
      ctx.stroke();

      // check pin collision
      if (mouseWentDown) {
        slider.isDragging = pointInCircle(mouseX, mouseY, pinX, pinY, PIN_RADIUS);;
        slider.grabOffset = mouseX - pinX;
      }
    } break;

    default: console.assert(false);
  }

  if (mouseWentUp) {
    slider.isDragging = false;
  }

  let result = null;

  if (slider.isDragging) {
    slider.currentRatio = (mouseX - minPinX - slider.grabOffset) / (maxPinX - minPinX);
    slider.currentRatio = Math.min(Math.max(0, slider.currentRatio), 1);
  } else {
    slider.currentRatio += (slider.targetRatio - slider.currentRatio) / 4;
  }

  let roundedRatio = 0;
  if (items) {
    roundedRatio = Math.round(slider.currentRatio * (items.length - 1)) / (items.length - 1);
    const itemIndex = roundedRatio * (items.length - 1);
    result = items[itemIndex];
  } else {
    console.assert(min !== undefined && max !== undefined);

    const range = max - min;
    roundedRatio = Math.round(slider.currentRatio * range) / range;
    result = Math.round(roundedRatio * range);
  }
  if (roundedRatio !== slider.targetRatio) {
    slider.targetRatio = roundedRatio;
  }

  return result;
}

function drawLegend(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, items: number[]) {
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex];
    ctx.fillStyle = '#000';

    const legendX = 12 + x + itemIndex / (items.length - 1) * width;
    const legendY = y;
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText(item.toString(), legendX, legendY);
  }
}

const slider: SliderState = {
  isDragging: false,
  grabOffset: 0,
  currentRatio: 0,
  targetRatio: 0,
  currentSelectableWidth: 0,
};


enum ContentAlign {
  TOP,
  CENTER,
  BOTTOM,
  STRETCH,
  LEFT,
  RIGHT,
}

enum CellKind {
  NONE,
  IMAGE,
  TEXT,
  GRID,
  ARROW,
  SLIDER,
}

enum ContentFlag {
  NONE,
  EXPAND,
  SHRINK,
}


const loop = () => {
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

  const zoom = getZoom();

  ctx.clearRect(0, 0, canvas.width * zoom, canvas.height * zoom);

  const maxWidth = canvas.width / zoom;
  const maxHeight = canvas.height / zoom;

  const appGrid = beginGrid({
    cols: 1, rows: 1,
    preferedWidth: maxWidth,
    preferedHeight: maxHeight,
    flexFactorX: [1],
    flexFactorY: [1],
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

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function makeRect(x: number, y: number, width: number, height: number) {
  const result: Rect = { x, y, width, height };
  return result;
}

interface CellParams {
  minWidth?: number;
  minHeight?: number;

  maxWidth?: number;
  maxHeight?: number;

  preferedHeight?: number;
  preferedWidth?: number;

  contentX?: ContentFlag;
  contentY?: ContentFlag;

  contentAlignX?: ContentAlign;
  contentAlignY?: ContentAlign;
}

interface CellInfo {
  kind: CellKind;

  minWidth: number;
  minHeight: number;

  maxWidth: number;
  maxHeight: number;

  preferedHeight: number;
  preferedWidth: number;

  contentX: ContentFlag;
  contentY: ContentFlag;

  contentAlignX: ContentAlign;
  contentAlignY: ContentAlign;

  cellWidth: number;
  cellHeight: number;
  contentWidth: number;
  contentHeight: number;
}

interface CellImage extends CellInfo {
  kind: CellKind.IMAGE;
  image: HTMLImageElement;
}

interface CellText extends CellInfo {
  kind: CellKind.TEXT;
  text: string;
  font: string;
}

interface CellArrow extends CellInfo {
  kind: CellKind.ARROW;
  angle: number;
}

interface Band {
  size: number;
  flexFactor: number;
}

interface CellGrid extends CellInfo {
  kind: CellKind.GRID;
  cells: Cell[];
  cols: number;
  rows: number;
  bandsX: Band[];
  bandsY: Band[];
  sumOfCellsWidth: number;
  sumOfCellsHeight: number;
  totalFlexFactorPosX: number;
  totalFlexFactorPosY: number;
  totalFlexFactorNegX: number;
  totalFlexFactorNegY: number;
}

interface CellSlider extends CellInfo {
  kind: CellKind.SLIDER;
  sliderParams: SliderParams;
  state: SliderState;
}

type Cell = CellImage | CellText | CellArrow | CellGrid | CellSlider;

function makeDefaultCell() {
  const result = {
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
    maxHeight: Infinity,
  };
  return result;
}



const ARROW_WIDTH = 5;
const ARROW_HEIGHT = 10;

function rotateVector(x: number, y: number, angle: number) {
  const result = {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: y * Math.cos(angle) - x * Math.sin(angle),
  };
  return result;
}

function getFontHeight(ctx: CanvasRenderingContext2D) {
  const result = parseInt(ctx.font.match(/\d+/)[0], 10);
  return result;
}

function getMultilineHeight(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ');
  const fontHeight = getFontHeight(ctx);

  let lineWidth = ctx.measureText(words[0]).width;
  let lineCount = 1;

  for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const wordLength = ctx.measureText(word).width;
    lineWidth += wordLength;

    if (lineWidth > maxWidth) {
      lineCount++;
      lineWidth = wordLength;
    }
  }

  const result = lineCount * fontHeight;
  return result;
}

function fillMultilineText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
  const words = text.split(' ');
  const wordLengths = [];

  const fontHeight = getFontHeight(ctx);

  let lineWidth = ctx.measureText(words[0]).width;
  let lineCount = 1;
  wordLengths[0] = lineWidth;

  for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const wordLength = ctx.measureText(word).width;
    wordLengths[wordIndex] = wordLength;
    lineWidth += wordLength;

    if (lineWidth > maxWidth) {
      lineCount++;
      lineWidth = wordLength;
    }
  }

  ctx.textBaseline = 'top';
  let drawX = x;
  let drawY = y - lineCount * fontHeight * 0.5;

  lineWidth = wordLengths[0];
  let line = words[0] + ' ';
  for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const wordLength = wordLengths[wordIndex];
    lineWidth += wordLength;

    if (lineWidth > maxWidth) {
      ctx.fillText(line, drawX, drawY);
      lineWidth = wordLength;
      line = word;
      drawY += fontHeight;
    } else {
      line += word;
    }

    if (wordIndex !== words.length - 1) {
      line += ' ';
    }
  }
  ctx.fillText(line, drawX, drawY);
}

function calcCell(item: Cell) {
  switch (item.kind) {
    case CellKind.GRID: {

      for (let cellIndex = 0; cellIndex < item.cells.length; cellIndex++) {
        const gridY = Math.floor(cellIndex / item.cols);
        const gridX = cellIndex - gridY;


        const childCell = item.cells[cellIndex];
        calcCell(childCell);

        const bandX = item.bandsX[gridX];
        const bandY = item.bandsY[gridY];
        if (childCell.contentWidth > bandX.size) {
          bandX.size = childCell.contentWidth;
        }
        if (childCell.contentHeight > bandY.size) {
          bandY.size = childCell.contentHeight;
        }
      }

      let totalWidth = 0;
      let totalHeight = 0;
      for (let i = 0; i < item.bandsX.length; i++) {
        totalWidth += item.bandsX[i].size;
      }
      for (let i = 0; i < item.bandsY.length; i++) {
        totalHeight += item.bandsY[i].size;
      }

      const width = item.preferedWidth || totalWidth;
      const height = item.preferedHeight || totalHeight;
      item.contentWidth = width;
      item.contentHeight = height;
      item.sumOfCellsWidth = totalWidth;
      item.sumOfCellsHeight = totalHeight;

      for (let i = 0; i < item.cells.length; i++) {
        const gridY = Math.floor(i / item.cols);
        const gridX = i - gridY;
        const cell = item.cells[i];
        let width = item.bandsX[gridX].size;
        let height = item.bandsY[gridY].size;

        cell.cellWidth = width;
        cell.cellHeight = height;
      }
    } break;

    case CellKind.ARROW: {
      const { x, y } = rotateVector(ARROW_WIDTH, ARROW_HEIGHT, item.angle);
      item.contentWidth = x;
      item.contentHeight = y;
    } break;
    case CellKind.TEXT: {
      ctx.font = item.font;
      const width = item.preferedWidth || ctx.measureText(item.text).width;
      const height = item.preferedHeight || getMultilineHeight(ctx, item.text, width);
      item.contentWidth = width;
      item.contentHeight = height;
    } break;
    case CellKind.IMAGE: {
      item.contentWidth = item.preferedWidth || item.image.width;
      item.contentHeight = item.preferedHeight || item.image.height;
    } break;

    case CellKind.SLIDER: {
      item.contentHeight = item.preferedHeight || item.sliderParams.height;
      item.contentWidth = item.preferedWidth || item.sliderParams.width;
    } break;

    default: console.assert(false);
  }
}

function drawCell(ctx: CanvasRenderingContext2D, item: Cell, cellX: number, cellY: number) {
  let contentX = cellX;
  let contentY = cellY;

  switch (item.contentX) {
    case ContentFlag.NONE: break;
    case ContentFlag.EXPAND: {
      item.contentWidth = item.cellWidth;
    } break;
    case ContentFlag.SHRINK: {
      if (item.contentWidth > item.cellWidth) {
        item.contentWidth = item.cellWidth;
      }
    } break;
    default: console.assert(false);
  }

  switch (item.contentY) {
    case ContentFlag.NONE: break;
    case ContentFlag.EXPAND: {
      item.contentHeight = item.cellHeight;
    } break;
    case ContentFlag.SHRINK: {
      if (item.contentHeight > item.cellHeight) {
        item.contentHeight = item.cellHeight;
      }
    } break;
    default: console.assert(false);
  }

  if (item.contentAlignX !== undefined) {
    switch (item.contentAlignX) {
      case ContentAlign.LEFT: break;
      case ContentAlign.CENTER: contentX = cellX + item.cellWidth * 0.5 - item.contentWidth * 0.5; break;
      case ContentAlign.RIGHT: contentX = cellX + item.cellWidth - item.contentWidth; break;
      default: console.assert(false);
    }
  }

  if (item.contentAlignY !== undefined) {
    switch (item.contentAlignY) {
      case ContentAlign.TOP: break;
      case ContentAlign.CENTER: contentY = cellY + item.cellHeight * 0.5 - item.contentHeight * 0.5; break;
      case ContentAlign.BOTTOM: contentY = cellY + item.cellHeight - item.contentHeight; break;
      default: console.assert(false);
    }
  }

  ctx.strokeStyle = `rgb(100, 200, 100)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(cellX, cellY, item.cellWidth, item.cellHeight);

  switch (item.kind) {
    case CellKind.GRID: {
      let childX = contentX;
      let childY = contentY;

      let spaceLeftX = item.contentWidth - item.sumOfCellsWidth;
      if (spaceLeftX) {
        for (let x = 0; x < item.bandsX.length; x++) {
          const bandX = item.bandsX[x];
          if (Math.sign(bandX.flexFactor) === Math.sign(spaceLeftX)) {
            const ratio = bandX.flexFactor / item.totalFlexFactorPosX;
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

      for (let cellIndex = 0; cellIndex < item.cells.length; cellIndex++) {
        const cell = item.cells[cellIndex];
        const gridY = Math.floor(cellIndex / item.cols);
        const gridX = cellIndex - gridY;

        drawCell(ctx, cell, childX, childY);

        if (gridX === item.cols - 1) {
          childY += cell.cellHeight;
          childX = contentX;
        } else {
          childX += cell.cellWidth;
        }
      }
    } break;

    case CellKind.ARROW: {
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
    } break;
    case CellKind.TEXT: {
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000';
      if (item.font) {
        ctx.font = item.font;
      }
      fillMultilineText(
        ctx, item.text,
        contentX + item.contentWidth * 0.5, contentY + item.contentHeight * 0.5,
        item.contentWidth,
      );
      // ctx.fillText(item.text, contentX + item.contentWidth * 0.5, contentY + item.contentHeight * 0.5);
    } break;
    case CellKind.IMAGE: {
      ctx.drawImage(item.image, contentX, contentY, item.contentWidth, item.contentHeight);
    } break;

    case CellKind.SLIDER: {
      drawSlider(ctx, item.state, {
        ...item.sliderParams,
        x: contentX, y: contentY,
        width: item.contentWidth, height: item.contentHeight,
      });
    } break;

    default: console.assert(false);
  }
}

function renderCell(ctx: CanvasRenderingContext2D, cell: Cell, x: number, y: number) {
  // calculate the dimensions
  calcCell(cell);

  // render on the canvas
  drawCell(ctx, cell, x, y);
}


function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  return img;
}

const imgHeader = loadImage('https://static.beeline.ru/upload/images/business/logo.svg');


interface State {
  gridStack: CellGrid[],
}

const state: State = {
  gridStack: [],
}

function peek<T>(arr: T[]) {
  console.assert(arr.length > 0);
  const result = arr[arr.length - 1];
  return result;
}

function pushCell(cell: Cell) {
  const grid = peek(state.gridStack);
  console.assert(grid.cells.length < grid.cols * grid.rows);

  grid.cells.push(cell);
  return cell;
}


interface GridParams extends CellParams {
  cols: number;
  rows: number;
  flexFactorX?: number[];
  flexFactorY?: number[];
}

function clone<T>(thing: T): T {
  if (Array.isArray(thing)) {
    return thing.slice() as unknown as T;
  }
  if (thing && typeof thing === 'object') {
    const result: any = {};
    for (let key in thing) {
      result[key] = clone(thing[key]);
    }
    return result;
  }

  return thing;
}

function makeArrayOfCopies<T>(item: T, count: number) {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(clone(item));
  }
  return result;
}

function beginGrid(params: GridParams) {
  const grid: CellGrid = {
    ...makeDefaultCell(),
    kind: CellKind.GRID,
    ...params,
    cells: [],
    bandsX: makeArrayOfCopies({ size: 0, flexFactor: 0 }, params.cols),
    bandsY: makeArrayOfCopies({ size: 0, flexFactor: 0 }, params.rows),
    sumOfCellsWidth: 0,
    sumOfCellsHeight: 0,
    totalFlexFactorPosX: 0,
    totalFlexFactorNegX: 0,
    totalFlexFactorPosY: 0,
    totalFlexFactorNegY: 0,
  };

  if (params.flexFactorX) {
    for (let x = 0; x < params.flexFactorX.length; x++) {
      const f = params.flexFactorX[x];
      grid.bandsX[x].flexFactor = f;
      if (f > 0) {
        grid.totalFlexFactorPosX += f;
      } else {
        grid.totalFlexFactorNegX += f;
      }
    }
  }
  if (params.flexFactorY) {
    for (let y = 0; y < params.flexFactorY.length; y++) {
      const f = params.flexFactorY[y];
      grid.bandsX[y].flexFactor = f;
      if (f > 0) {
        grid.totalFlexFactorPosY += f;
      } else {
        grid.totalFlexFactorNegY += f;
      }
    }
  }

  if (state.gridStack.length) {
    const parentGrid = peek(state.gridStack);
    parentGrid.cells.push(grid);
  }
  state.gridStack.push(grid);


  return grid;
}

interface ImageParams extends CellParams {
  image: HTMLImageElement;
}

function cellDrawImage(params: ImageParams) {
  const parentGrid = peek(state.gridStack);
  const image: CellImage = {
    ...makeDefaultCell(),
    kind: CellKind.IMAGE,
    ...params,
  };

  parentGrid.cells.push(image);
}

interface TextParams extends CellParams {
  text: string;
  font: string;
}

function cellDrawText(params: TextParams) {
  const parentGrid = peek(state.gridStack);
  const image: CellText = {
    ...makeDefaultCell(),
    kind: CellKind.TEXT,
    ...params,
  };

  parentGrid.cells.push(image);
}

interface ArrowParams extends CellParams {
  angle: number;
}

function cellDrawArrow(params: ArrowParams) {
  const parentGrid = peek(state.gridStack);
  const arrow: CellArrow = {
    ...makeDefaultCell(),
    kind: CellKind.ARROW,
    ...params,
  };

  parentGrid.cells.push(arrow);
}

interface SliderCellParams extends CellParams {
  state: SliderState;
  sliderParams: SliderParams;
}

function cellDrawSlider(params: SliderCellParams) {
  const parentGrid = peek(state.gridStack);
  const arrow: CellSlider = {
    ...makeDefaultCell(),
    kind: CellKind.SLIDER,
    ...params,
  };

  parentGrid.cells.push(arrow);
}

function endGrid() {
  state.gridStack.pop();
}

function makeDim() {
  const result = {
    min: 0,
    max: 0,
    preferred: 0,
    reported: 0,
  };
  return result;
}

function repeatArray<T>(arr: T[], times: number) {
  const result: T[] = [];
  for (let i = 0; i < times; i++) {
    for (let j = 0; j < arr.length; j++) {
      result.push(arr[j]);
    }
  }
  return result;
}

function drawHeader() {
  const mainMenuItems = [
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
    flexFactorX: [0, 1],
  }); {

    cellDrawImage({
      image: imgHeader,
      preferedHeight: 40,
      preferedWidth: imgHeader.width * 40 / imgHeader.height,
      contentAlignY: ContentAlign.CENTER,
    });

    beginGrid({
      cols: 10, rows: 1,
      contentY: ContentFlag.EXPAND,
      contentAlignX: ContentAlign.CENTER,
      contentX: ContentFlag.SHRINK,
      flexFactorX: repeatArray([-1, 0], mainMenuItems.length),
      flexMinWidth: repeatArray([30, 0], mainMenuItems.length),
      flexFactorY: [1],
    }); {
      // draw menu item
      for (let i = 0; i < mainMenuItems.length; i++) {
        cellDrawText({
          text: mainMenuItems[i], font: '14px Arial',
          contentAlignY: ContentAlign.CENTER,
          contentX: ContentFlag.SHRINK,
          minWidth: 30,
        });
        cellDrawArrow({
          angle: -Math.PI * 0.5,
          contentAlignY: ContentAlign.CENTER,
        });
      }
    } endGrid();
  } endGrid();
}


declare interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any;
}



requestAnimationFrame(loop);
