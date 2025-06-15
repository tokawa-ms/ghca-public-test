// Tetris Game - 80年代レトロスタイル

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // ゲーム設定
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // ゲーム状態
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.dropTimer = 0;
        this.dropInterval = 1000; // 1秒
        
        // テトロミノの定義
        this.tetrominoes = {
            I: {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#00ffff'
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#ffff00'
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#ff00ff'
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#00ff00'
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#ff0000'
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#0000ff'
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#ffa500'
            }
        };
        
        this.init();
    }
    
    init() {
        this.initBoard();
        this.bindEvents();
        this.initAudio();
        this.draw();
    }
    
    initBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    bindEvents() {
        // ボタンイベント
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('restartFromGameOver').addEventListener('click', () => this.restartGame());
        
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    initAudio() {
        // Korobeiniki melody using Web Audio API
        this.audioContext = null;
        this.isPlayingMusic = false;
    }
    
    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume audio context if suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    startGame() {
        this.ensureAudioContext(); // Initialize audio context on user interaction
        
        this.gameRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.dropTimer = 0;
        
        this.initBoard();
        this.currentPiece = this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('gameOver').classList.add('hidden');
        
        this.updateUI();
        this.startGameLoop();
        this.playKorobeiniki();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? 'RESUME' : 'PAUSE';
        
        if (this.isPaused) {
            this.stopGameLoop();
        } else {
            this.startGameLoop();
        }
    }
    
    restartGame() {
        this.stopGameLoop();
        this.gameRunning = false;
        this.isPaused = false;
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'PAUSE';
        document.getElementById('gameOver').classList.add('hidden');
        
        this.initBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        
        this.updateUI();
        this.draw();
        this.stopMusic();
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (!this.isPaused && this.gameRunning) {
                this.update();
                this.draw();
            }
        }, 16); // 60 FPS
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update() {
        this.dropTimer += 16;
        
        if (this.dropTimer >= this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTimer = 0;
        }
    }
    
    createRandomPiece() {
        const types = Object.keys(this.tetrominoes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const tetromino = this.tetrominoes[randomType];
        
        return {
            type: randomType,
            shape: tetromino.shape,
            color: tetromino.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
            y: 0
        };
    }
    
    canMovePiece(piece, dx, dy, newShape = null) {
        const shape = newShape || piece.shape;
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    // 境界チェック
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT) {
                        return false;
                    }
                    
                    // ボード上の他のブロックとの衝突チェック
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        if (this.canMovePiece(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        } else if (dy > 0) {
            // 下に移動できない場合、ピースを固定
            this.lockPiece();
            return false;
        }
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        
        if (this.canMovePiece(this.currentPiece, 0, 0, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // ピースをボードに固定
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // ライン消去チェック
        this.clearLines();
        
        // 新しいピースを生成
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        
        // ゲームオーバーチェック
        if (!this.canMovePiece(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 同じ行を再チェック
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateUI();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.stopGameLoop();
        this.stopMusic();
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.isPaused) {
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            return;
        }
        
        switch (e.code) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'Space':
                // ハードドロップ
                while (this.movePiece(0, 1)) {}
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
        e.preventDefault();
    }
    
    draw() {
        // メインキャンバスをクリア
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ボードを描画
        this.drawBoard();
        
        // 現在のピースを描画
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // 次のピースを描画
        this.drawNextPiece();
    }
    
    drawBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x], this.ctx);
                }
            }
        }
    }
    
    drawPiece(piece, context) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.drawBlock(piece.x + x, piece.y + y, piece.color, context);
                }
            }
        }
    }
    
    drawBlock(x, y, color, context) {
        const pixelX = x * this.BLOCK_SIZE;
        const pixelY = y * this.BLOCK_SIZE;
        
        // ブロックの背景
        context.fillStyle = color;
        context.fillRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        // ピクセルアート風のボーダー
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.strokeRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        // ハイライト効果
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, 2);
        context.fillRect(pixelX + 1, pixelY + 1, 2, this.BLOCK_SIZE - 2);
    }
    
    drawNextPiece() {
        // 次のピースキャンバスをクリア
        this.nextCtx.fillStyle = '#000011';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const centerX = Math.floor((this.nextCanvas.width / 20 - this.nextPiece.shape[0].length) / 2);
            const centerY = Math.floor((this.nextCanvas.height / 20 - this.nextPiece.shape.length) / 2);
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        const pixelX = (centerX + x) * 20;
                        const pixelY = (centerY + y) * 20;
                        
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(pixelX, pixelY, 20, 20);
                        
                        this.nextCtx.strokeStyle = '#ffffff';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(pixelX, pixelY, 20, 20);
                    }
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    // Korobeiniki melody implementation
    playKorobeiniki() {
        if (this.isPlayingMusic || !this.audioContext) return;
        this.isPlayingMusic = true;
        
        // Korobeiniki melody notes (simplified version)
        const melody = [
            { note: 659.25, duration: 0.5 }, // E5
            { note: 493.88, duration: 0.25 }, // B4
            { note: 523.25, duration: 0.25 }, // C5
            { note: 587.33, duration: 0.5 }, // D5
            { note: 523.25, duration: 0.25 }, // C5
            { note: 493.88, duration: 0.25 }, // B4
            { note: 440.00, duration: 0.5 }, // A4
            { note: 440.00, duration: 0.25 }, // A4
            { note: 523.25, duration: 0.25 }, // C5
            { note: 659.25, duration: 0.5 }, // E5
            { note: 587.33, duration: 0.25 }, // D5
            { note: 523.25, duration: 0.25 }, // C5
            { note: 493.88, duration: 0.75 }, // B4
            { note: 523.25, duration: 0.25 }, // C5
            { note: 587.33, duration: 0.5 }, // D5
            { note: 659.25, duration: 0.5 }, // E5
            { note: 523.25, duration: 0.5 }, // C5
            { note: 440.00, duration: 0.5 }, // A4
            { note: 440.00, duration: 1.0 }   // A4
        ];
        
        this.playMelody(melody, 0);
    }
    
    playMelody(melody, index) {
        if (!this.gameRunning || index >= melody.length) {
            // メロディが終わったら最初から繰り返す
            if (this.gameRunning) {
                setTimeout(() => this.playMelody(melody, 0), 1000);
            }
            return;
        }
        
        const note = melody[index];
        this.playNote(note.note, note.duration * 400); // duration in ms
        
        setTimeout(() => {
            this.playMelody(melody, index + 1);
        }, note.duration * 400 + 50); // 小さな間隔
    }
    
    playNote(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'square'; // レトロなチップチューン風
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    stopMusic() {
        this.isPlayingMusic = false;
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
});