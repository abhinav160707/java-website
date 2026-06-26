// visualizers.js - Custom Interactive Canvas Visualizers for Java DSA Learning Hub

class DSVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.animationId = null;
        this.stepIndex = 0;
        this.isPlaying = false;
        this.states = [];
        this.colors = {
            bg: '#13111c',
            grid: '#1f1a30',
            primary: '#6366f1',    // Indigo
            secondary: '#10b981',  // Emerald
            accent: '#f59e0b',     // Amber
            danger: '#ef4444',     // Rose
            text: '#e2e8f0',       // Slate 200
            textMuted: '#94a3b8',  // Slate 400
            neutral: '#334155'     // Slate 700
        };
    }

    clear() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw subtle grid lines for tech look
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    next() {
        if (this.stepIndex < this.states.length - 1) {
            this.stepIndex++;
            this.draw();
            this.updateStatusText();
        }
    }

    prev() {
        if (this.stepIndex > 0) {
            this.stepIndex--;
            this.draw();
            this.updateStatusText();
        }
    }

    reset() {
        this.stepIndex = 0;
        this.draw();
        this.updateStatusText();
    }

    updateStatusText() {
        const textContainer = document.getElementById('visualizer-status');
        if (textContainer && this.states[this.stepIndex]) {
            textContainer.textContent = this.states[this.stepIndex].message || `Step ${this.stepIndex + 1} of ${this.states.length}`;
        }
    }
}

// 1. Binary Search Visualizer
class BinarySearchVisualizer extends DSVisualizer {
    constructor(canvasId) {
        super(canvasId);
        this.arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
        this.target = 23;
        this.generateStates();
        this.reset();
    }

    generateStates() {
        this.states = [];
        let low = 0;
        let high = this.arr.length - 1;
        
        this.states.push({
            low, high, mid: -1,
            checked: -1,
            message: `Initialize: low = 0, high = ${high}. Searching for target: ${this.target}`
        });

        while (low <= high) {
            let mid = Math.floor(low + (high - low) / 2);
            this.states.push({
                low, high, mid,
                checked: -1,
                message: `Calculate midpoint: mid = ${mid} (value = ${this.arr[mid]}). Check if matches target.`
            });

            if (this.arr[mid] === this.target) {
                this.states.push({
                    low, high, mid,
                    checked: mid,
                    message: `Target ${this.target} found at index ${mid}! Search successful.`
                });
                return;
            } else if (this.arr[mid] < this.target) {
                let oldLow = low;
                low = mid + 1;
                this.states.push({
                    low, high, mid,
                    checked: -1,
                    message: `${this.arr[mid]} < ${this.target}. Shift low pointer to mid + 1 (${low}). Discard left half.`
                });
            } else {
                let oldHigh = high;
                high = mid - 1;
                this.states.push({
                    low, high, mid,
                    checked: -1,
                    message: `${this.arr[mid]} > ${this.target}. Shift high pointer to mid - 1 (${high}). Discard right half.`
                });
            }
        }

        this.states.push({
            low, high, mid: -1,
            checked: -1,
            message: `low (${low}) > high (${high}). Search space exhausted. Target not found.`
        });
    }

    draw() {
        this.clear();
        const state = this.states[this.stepIndex];
        if (!state) return;

        const cellWidth = 55;
        const cellHeight = 45;
        const startX = (this.width - (this.arr.length * cellWidth)) / 2;
        const startY = this.height / 2 - 20;

        // Draw array title & Target
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 15px Outfit, sans-serif';
        this.ctx.fillText(`Target: ${this.target}`, startX, startY - 45);

        for (let i = 0; i < this.arr.length; i++) {
            const x = startX + (i * cellWidth);
            const y = startY;

            // Determine cell coloring based on pointers
            let isInactive = i < state.low || i > state.high;
            let isMid = i === state.mid;
            let isMatched = i === state.checked;

            if (isMatched) {
                this.ctx.fillStyle = this.colors.secondary;
            } else if (isMid) {
                this.ctx.fillStyle = this.colors.accent;
            } else if (isInactive) {
                this.ctx.fillStyle = this.colors.neutral;
            } else {
                this.ctx.fillStyle = this.colors.primary;
            }

            // Draw rounded cell card
            this.ctx.beginPath();
            this.ctx.roundRect(x + 2, y, cellWidth - 4, cellHeight, 6);
            this.ctx.fill();

            // Cell border glow
            this.ctx.strokeStyle = isMid ? '#fff' : 'rgba(255,255,255,0.1)';
            this.ctx.lineWidth = isMid ? 2 : 1;
            this.ctx.stroke();

            // Draw Value
            this.ctx.fillStyle = isInactive ? this.colors.textMuted : '#fff';
            this.ctx.font = 'bold 16px Outfit, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.arr[i], x + cellWidth / 2, y + cellHeight / 2);

            // Draw Index below cell
            this.ctx.fillStyle = this.colors.textMuted;
            this.ctx.font = '12px Outfit, sans-serif';
            this.ctx.fillText(`[${i}]`, x + cellWidth / 2, y + cellHeight + 15);
        }

        // Draw pointers (low, high, mid)
        this.ctx.font = '12px Outfit, sans-serif';
        this.ctx.textAlign = 'center';

        if (state.low < this.arr.length && state.low >= 0) {
            const lowX = startX + (state.low * cellWidth) + cellWidth / 2;
            this.ctx.fillStyle = this.colors.primary;
            this.ctx.fillText("▲", lowX, startY + cellHeight + 35);
            this.ctx.fillText("low", lowX, startY + cellHeight + 47);
        }

        if (state.high < this.arr.length && state.high >= 0) {
            const highX = startX + (state.high * cellWidth) + cellWidth / 2;
            this.ctx.fillStyle = this.colors.danger;
            this.ctx.fillText("▲", highX, startY + cellHeight + 35);
            this.ctx.fillText("high", highX, startY + cellHeight + 47);
        }

        if (state.mid !== -1) {
            const midX = startX + (state.mid * cellWidth) + cellWidth / 2;
            this.ctx.fillStyle = this.colors.accent;
            this.ctx.fillText("▼", midX, startY - 10);
            this.ctx.fillText("mid", midX, startY - 22);
        }
    }
}

// 2. Sorting Visualizer (Bubble Sort & Selection Sort)
class SortingVisualizer extends DSVisualizer {
    constructor(canvasId, method = "bubble") {
        super(canvasId);
        this.method = method;
        this.arr = [38, 12, 72, 5, 56, 23, 91, 16];
        this.generateStates();
        this.reset();
    }

    generateStates() {
        this.states = [];
        let tempArr = [...this.arr];
        let n = tempArr.length;

        if (this.method === "bubble") {
            this.states.push({
                array: [...tempArr],
                active: [],
                sorted: [],
                message: "Initialize unsorted array. Prepare for bubble sort passes."
            });

            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    this.states.push({
                        array: [...tempArr],
                        active: [j, j + 1],
                        sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
                        message: `Compare adjacent elements at index ${j} (${tempArr[j]}) and ${j+1} (${tempArr[j+1]})`
                    });

                    if (tempArr[j] > tempArr[j + 1]) {
                        // Swap
                        let temp = tempArr[j];
                        tempArr[j] = tempArr[j + 1];
                        tempArr[j + 1] = temp;

                        this.states.push({
                            array: [...tempArr],
                            active: [j, j + 1],
                            sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
                            swapping: true,
                            message: `${tempArr[j+1]} > ${tempArr[j]}. Swap them.`
                        });
                    }
                }
                // End of pass
                this.states.push({
                    array: [...tempArr],
                    active: [],
                    sorted: Array.from({ length: i + 1 }, (_, idx) => n - 1 - idx),
                    message: `End of pass ${i + 1}. Element at index ${n - 1 - i} (${tempArr[n-1-i]}) is placed in its sorted position.`
                });
            }
            // Fully sorted
            this.states.push({
                array: [...tempArr],
                active: [],
                sorted: Array.from({ length: n }, (_, idx) => idx),
                message: "Sorting completed! All elements are organized."
            });
        }
    }

    draw() {
        this.clear();
        const state = this.states[this.stepIndex];
        if (!state) return;

        const maxVal = 100;
        const padding = 15;
        const barWidth = (this.width - (padding * (this.arr.length + 1))) / this.arr.length;
        const maxHeight = this.height - 100;

        for (let i = 0; i < state.array.length; i++) {
            const val = state.array[i];
            const h = (val / maxVal) * maxHeight;
            const x = padding + i * (barWidth + padding);
            const y = this.height - h - 30;

            // Coloring logic
            let color = this.colors.primary;
            if (state.sorted.includes(i)) {
                color = this.colors.secondary;
            } else if (state.active.includes(i)) {
                color = state.swapping ? this.colors.danger : this.colors.accent;
            }

            // Draw bar card
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, h, 4);
            this.ctx.fill();

            // Value text above bar
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = 'bold 14px Outfit, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(val, x + barWidth / 2, y - 8);

            // Index text below bar
            this.ctx.fillStyle = this.colors.textMuted;
            this.ctx.font = '11px Outfit, sans-serif';
            this.ctx.fillText(`[${i}]`, x + barWidth / 2, this.height - 10);
        }
    }
}

// 3. Stack Visualizer (LIFO)
class StackVisualizer extends DSVisualizer {
    constructor(canvasId) {
        super(canvasId);
        this.items = [];
        this.generateStates();
        this.reset();
    }

    generateStates() {
        this.states = [
            { stack: [], action: 'init', message: "Stack created empty. References: top = null" },
            { stack: [12], action: 'push', val: 12, message: "Push 12 to Stack. top points to node storing 12" },
            { stack: [12, 5], action: 'push', val: 5, message: "Push 5 to Stack. New node (5) points to previous top (12)" },
            { stack: [12, 5, 23], action: 'push', val: 23, message: "Push 23 to Stack. New node (23) points to previous top (5)" },
            { stack: [12, 5], action: 'pop', val: 23, message: "Pop element. Retrieve 23 and redirect top pointer to 5" },
            { stack: [12, 5, 72], action: 'push', val: 72, message: "Push 72 to Stack. top pointer updates to 72" },
            { stack: [12, 5], action: 'pop', val: 72, message: "Pop element. Retrieve 72. top shifts to 5" },
            { stack: [12], action: 'pop', val: 5, message: "Pop element. Retrieve 5. top shifts to 12" },
            { stack: [], action: 'pop', val: 12, message: "Pop element. Stack becomes empty. top = null" }
        ];
    }

    draw() {
        this.clear();
        const state = this.states[this.stepIndex];
        if (!state) return;

        const tubeWidth = 100;
        const tubeX = (this.width - tubeWidth) / 2;
        const tubeY = 50;
        const tubeHeight = this.height - 100;
        const cellHeight = 45;

        // Draw the stack tube boundary
        this.ctx.strokeStyle = this.colors.neutral;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(tubeX, tubeY);
        this.ctx.lineTo(tubeX, tubeY + tubeHeight);
        this.ctx.lineTo(tubeX + tubeWidth, tubeY + tubeHeight);
        this.ctx.lineTo(tubeX + tubeWidth, tubeY);
        this.ctx.stroke();

        // Label bottom boundary
        this.ctx.fillStyle = this.colors.textMuted;
        this.ctx.font = '12px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Base", tubeX + tubeWidth / 2, tubeY + tubeHeight + 20);

        // Draw items inside stack
        const items = state.stack;
        for (let i = 0; i < items.length; i++) {
            const val = items[i];
            const y = tubeY + tubeHeight - (i + 1) * cellHeight - 5;
            const x = tubeX + 5;
            const w = tubeWidth - 10;

            // Highlight top item
            const isTop = i === items.length - 1;
            this.ctx.fillStyle = isTop ? this.colors.secondary : this.colors.primary;

            this.ctx.beginPath();
            this.ctx.roundRect(x, y, w, cellHeight - 4, 6);
            this.ctx.fill();

            // Draw Value
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 15px Outfit, sans-serif';
            this.ctx.fillText(val, x + w / 2, y + cellHeight / 2);

            // Draw Top Pointer
            if (isTop) {
                this.ctx.fillStyle = this.colors.accent;
                this.ctx.font = '12px Outfit, sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText("◀ top", x + w + 10, y + cellHeight / 2 + 3);
                this.ctx.textAlign = 'center';
            }
        }

        if (items.length === 0) {
            this.ctx.fillStyle = this.colors.danger;
            this.ctx.font = 'italic 14px Outfit, sans-serif';
            this.ctx.fillText("top = null (Empty Stack)", tubeX + tubeWidth / 2, tubeY + tubeHeight / 2);
        }
    }
}

// 4. Queue Visualizer (FIFO)
class QueueVisualizer extends DSVisualizer {
    constructor(canvasId) {
        super(canvasId);
        this.generateStates();
        this.reset();
    }

    generateStates() {
        this.states = [
            { queue: [], action: 'init', message: "Queue created empty. front = null, rear = null" },
            { queue: [8], action: 'enqueue', val: 8, message: "Enqueue 8. front = 8, rear = 8" },
            { queue: [8, 12], action: 'enqueue', val: 12, message: "Enqueue 12 (adds to rear). front = 8, rear = 12" },
            { queue: [8, 12, 45], action: 'enqueue', val: 45, message: "Enqueue 45 (adds to rear). front = 8, rear = 45" },
            { queue: [12, 45], action: 'dequeue', val: 8, message: "Dequeue deletes front (8). front shifts to 12, rear remains 45" },
            { queue: [12, 45, 99], action: 'enqueue', val: 99, message: "Enqueue 99. front = 12, rear = 99" },
            { queue: [45, 99], action: 'dequeue', val: 12, message: "Dequeue deletes front (12). front shifts to 45" },
            { queue: [99], action: 'dequeue', val: 45, message: "Dequeue deletes front (45). front = 99, rear = 99" },
            { queue: [], action: 'dequeue', val: 99, message: "Dequeue deletes front (99). Queue is empty" }
        ];
    }

    draw() {
        this.clear();
        const state = this.states[this.stepIndex];
        if (!state) return;

        const cellWidth = 55;
        const cellHeight = 50;
        const startY = (this.height - cellHeight) / 2;
        const queueSize = state.queue.length;
        const startX = (this.width - (6 * cellWidth)) / 2; // Fixed horizontal span for visual structure

        // Draw horizontal pipeline boundary
        this.ctx.strokeStyle = this.colors.neutral;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        // Top boundary
        this.ctx.moveTo(startX - 20, startY - 5);
        this.ctx.lineTo(startX + 6 * cellWidth + 20, startY - 5);
        // Bottom boundary
        this.ctx.moveTo(startX - 20, startY + cellHeight + 5);
        this.ctx.lineTo(startX + 6 * cellWidth + 20, startY + cellHeight + 5);
        this.ctx.stroke();

        this.ctx.fillStyle = this.colors.textMuted;
        this.ctx.font = '11px Outfit, sans-serif';
        this.ctx.fillText("◀ Dequeue (Front)", startX - 45, startY + cellHeight / 2);
        this.ctx.fillText("Enqueue (Rear) ◀", startX + 6 * cellWidth + 60, startY + cellHeight / 2);

        // Draw items
        for (let i = 0; i < queueSize; i++) {
            const val = state.queue[i];
            const x = startX + (i * cellWidth) + 5;
            const y = startY;

            // Highlight front and rear
            let color = this.colors.primary;
            if (i === 0) color = this.colors.secondary; // Front
            if (i === queueSize - 1) color = this.colors.accent; // Rear

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, cellWidth - 10, cellHeight, 6);
            this.ctx.fill();

            // Text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 15px Outfit, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(val, x + (cellWidth - 10) / 2, y + cellHeight / 2 + 5);

            // Draw pointers
            this.ctx.font = '11px Outfit, sans-serif';
            if (i === 0) {
                this.ctx.fillStyle = this.colors.secondary;
                this.ctx.fillText("▼ front", x + (cellWidth - 10) / 2, y - 15);
            }
            if (i === queueSize - 1 && queueSize > 1) {
                this.ctx.fillStyle = this.colors.accent;
                this.ctx.fillText("▲ rear", x + (cellWidth - 10) / 2, y + cellHeight + 20);
            }
            if (i === 0 && queueSize === 1) {
                this.ctx.fillStyle = this.colors.accent;
                this.ctx.fillText("▲ rear", x + (cellWidth - 10) / 2, y + cellHeight + 20);
            }
        }
    }
}

// 5. Singly Linked List Visualizer
class LinkedListVisualizer extends DSVisualizer {
    constructor(canvasId) {
        super(canvasId);
        this.generateStates();
        this.reset();
    }

    generateStates() {
        this.states = [
            { list: [10, 20, 30], action: 'init', activeNode: -1, pointerDir: 'normal', message: "Singly Linked List structure: Head ➔ [10] ➔ [20] ➔ [30] ➔ null" },
            { list: [10, 20, 30], action: 'step1', activeNode: 0, pointerDir: 'normal', message: "Reversing: Store current node (10) next reference, update pointers." },
            { list: [10, 20, 30], action: 'step2', activeNode: 0, reversedLinks: [0], pointerDir: 'firstReversed', message: "Link pointing out of [10] is redirected to null (previous is null)." },
            { list: [10, 20, 30], action: 'step3', activeNode: 1, reversedLinks: [0], pointerDir: 'normal', message: "Shift pointers forward: 'prev' becomes [10], 'curr' becomes [20]." },
            { list: [10, 20, 30], action: 'step4', activeNode: 1, reversedLinks: [0, 1], pointerDir: 'secondReversed', message: "Redirect link pointing out of [20] to prev ([10])." },
            { list: [10, 20, 30], action: 'step5', activeNode: 2, reversedLinks: [0, 1], pointerDir: 'normal', message: "Shift pointers forward: 'prev' becomes [20], 'curr' becomes [30]." },
            { list: [10, 20, 30], action: 'step6', activeNode: 2, reversedLinks: [0, 1, 2], pointerDir: 'allReversed', message: "Redirect link pointing out of [30] to prev ([20])." },
            { list: [30, 20, 10], action: 'finish', activeNode: -1, pointerDir: 'inverted', message: "Loop finished. Shift head pointer to prev ([30]). List reversed!" }
        ];
    }

    draw() {
        this.clear();
        const state = this.states[this.stepIndex];
        if (!state) return;

        const items = [10, 20, 30];
        const cellWidth = 70;
        const cellHeight = 40;
        const gap = 60;
        const startX = 60;
        const startY = this.height / 2 - 20;

        // Draw nodes
        for (let i = 0; i < items.length; i++) {
            const val = items[i];
            const x = startX + i * (cellWidth + gap);
            const y = startY;

            // Node visual box
            const isActive = i === state.activeNode;
            this.ctx.fillStyle = isActive ? this.colors.accent : this.colors.primary;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, cellWidth, cellHeight, 6);
            this.ctx.fill();

            // Partition dividing Data | Next
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(x + 45, y);
            this.ctx.lineTo(x + 45, y + cellHeight);
            this.ctx.stroke();

            // Text values
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Outfit, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(val, x + 22, y + cellHeight / 2 + 5);

            this.ctx.fillStyle = this.colors.textMuted;
            this.ctx.font = '10px Outfit, sans-serif';
            this.ctx.fillText("•", x + 58, y + cellHeight / 2 + 3);

            // Draw Pointer arrow
            this.ctx.strokeStyle = this.colors.secondary;
            this.ctx.lineWidth = 2.5;
            this.ctx.fillStyle = this.colors.secondary;

            let drawArrowRight = true;
            let drawArrowLeft = false;

            if (state.reversedLinks && state.reversedLinks.includes(i)) {
                drawArrowRight = false;
                drawArrowLeft = true;
            }

            if (state.action === 'finish') {
                drawArrowRight = false;
                drawArrowLeft = true;
            }

            const arrowY = y + cellHeight / 2;
            if (drawArrowRight) {
                // Point to next
                const arrowStartX = x + 58;
                const arrowEndX = arrowStartX + gap - 10;
                
                this.ctx.beginPath();
                this.ctx.moveTo(arrowStartX, arrowY);
                this.ctx.lineTo(arrowEndX, arrowY);
                this.ctx.stroke();

                // Arrowhead
                this.ctx.beginPath();
                this.ctx.moveTo(arrowEndX, arrowY - 5);
                this.ctx.lineTo(arrowEndX + 6, arrowY);
                this.ctx.lineTo(arrowEndX, arrowY + 5);
                this.ctx.fill();
            } else if (drawArrowLeft) {
                // Point backward to previous
                const arrowStartX = x;
                const arrowEndX = x - gap + 25;
                
                this.ctx.strokeStyle = this.colors.danger;
                this.ctx.fillStyle = this.colors.danger;
                
                this.ctx.beginPath();
                this.ctx.moveTo(arrowStartX, arrowY);
                this.ctx.lineTo(arrowEndX, arrowY);
                this.ctx.stroke();

                // Arrowhead pointing left
                this.ctx.beginPath();
                this.ctx.moveTo(arrowEndX, arrowY - 5);
                this.ctx.lineTo(arrowEndX - 6, arrowY);
                this.ctx.lineTo(arrowEndX, arrowY + 5);
                this.ctx.fill();
            }

            // Draw NULL indicator for final pointer
            if (i === items.length - 1 && drawArrowRight) {
                this.ctx.fillStyle = this.colors.textMuted;
                this.ctx.font = 'italic 12px Outfit, sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText("null", x + cellWidth + 15, arrowY + 4);
            }
            if (i === 0 && drawArrowLeft) {
                this.ctx.fillStyle = this.colors.textMuted;
                this.ctx.font = 'italic 12px Outfit, sans-serif';
                this.ctx.textAlign = 'right';
                this.ctx.fillText("null", x - 15, arrowY + 4);
            }
        }

        // Draw Head pointer
        this.ctx.fillStyle = this.colors.accent;
        this.ctx.font = 'bold 12px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        
        let headX = startX + cellWidth / 2;
        if (state.action === 'finish') {
            headX = startX + 2 * (cellWidth + gap) + cellWidth / 2;
        }

        this.ctx.fillText("head", headX, startY - 20);
        this.ctx.fillText("▼", headX, startY - 8);
    }
}

// 6. Binary Search Tree Visualizer (BST)
class BSTVisualizer extends DSVisualizer {
    constructor(canvasId) {
        super(canvasId);
        this.generateStates();
        this.reset();
    }

    generateStates() {
        this.states = [
            { highlight: [], text: "Root Node (22)", active: 22, message: "Initialize empty BST. Insert Root Node (22)" },
            { highlight: [22], text: "12 < 22, route left", active: 12, message: "Insert 12: Compare with root (22). 12 < 22, route left. Create node." },
            { highlight: [22], text: "30 > 22, route right", active: 30, message: "Insert 30: Compare with root (22). 30 > 22, route right. Create node." },
            { highlight: [22, 12], text: "8 < 12, route left of 12", active: 8, message: "Insert 8: 8 < 22 (left), 8 < 12 (left). Place as left child of 12." },
            { highlight: [22, 12], text: "20 > 12, route right of 12", active: 20, message: "Insert 20: 20 < 22 (left), 20 > 12 (right). Place as right child of 12." }
        ];
    }

    drawNode(x, y, val, isActive, isPath) {
        let strokeColor = 'rgba(255,255,255,0.1)';
        let fillColor = this.colors.primary;

        if (isActive) {
            fillColor = this.colors.accent;
            strokeColor = '#fff';
        } else if (isPath) {
            fillColor = this.colors.secondary;
        }

        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 18, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(val, x, y);
    }

    drawEdge(x1, y1, x2, y2) {
        this.ctx.strokeStyle = this.colors.neutral;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1 + 18);
        this.ctx.lineTo(x2, y2 - 18);
        this.ctx.stroke();
    }

    draw() {
        this.clear();
        const state = this.states[this.stepIndex];
        if (!state) return;

        // Tree structure layout nodes positions
        const nodes = [
            { val: 22, x: this.width / 2, y: 50 },
            { val: 12, x: this.width / 2 - 80, y: 120 },
            { val: 30, x: this.width / 2 + 80, y: 120 },
            { val: 8, x: this.width / 2 - 120, y: 190 },
            { val: 20, x: this.width / 2 - 40, y: 190 }
        ];

        // Draw connections for defined nodes in step
        const visibleIndices = this.stepIndex + 1; // Show nodes progressively
        
        if (visibleIndices > 1) this.drawEdge(nodes[0].x, nodes[0].y, nodes[1].x, nodes[1].y);
        if (visibleIndices > 2) this.drawEdge(nodes[0].x, nodes[0].y, nodes[2].x, nodes[2].y);
        if (visibleIndices > 3) this.drawEdge(nodes[1].x, nodes[1].y, nodes[3].x, nodes[3].y);
        if (visibleIndices > 4) this.drawEdge(nodes[1].x, nodes[1].y, nodes[4].x, nodes[4].y);

        // Draw nodes
        for (let i = 0; i < visibleIndices; i++) {
            const n = nodes[i];
            const isActive = n.val === state.active;
            const isPath = state.highlight.includes(n.val);
            this.drawNode(n.x, n.y, n.val, isActive, isPath);
        }
    }
}

// Global visualizer registry instantiation hook
function initializeVisualizer(topicId, canvasId) {
    let visualizer = null;
    if (topicId === "binary_search") {
        visualizer = new BinarySearchVisualizer(canvasId);
    } else if (topicId === "bubble_sort") {
        visualizer = new SortingVisualizer(canvasId, "bubble");
    } else if (topicId === "stack_impl") {
        visualizer = new StackVisualizer(canvasId);
    } else if (topicId === "circular_queue") {
        visualizer = new QueueVisualizer(canvasId);
    } else if (topicId === "reverse_ll") {
        visualizer = new LinkedListVisualizer(canvasId);
    } else if (topicId === "bst_insert_search") {
        visualizer = new BSTVisualizer(canvasId);
    }
    return visualizer;
}
