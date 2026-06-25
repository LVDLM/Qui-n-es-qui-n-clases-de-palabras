/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { WordClass, WordToken, CardState, GameMode } from "./types";
import { DEFAULT_WORD_POOL, generateBoard } from "./data";
import GameSettings from "./components/GameSettings";
import GameBoard from "./components/GameBoard";
import QuestionBox from "./components/QuestionBox";
import HistoryLog from "./components/HistoryLog";
import PrintLayout from "./components/PrintLayout";
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { handleFirestoreError, OperationType } from "./lib/firestore-errors";

function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
}

function formatWordExplanation(word: string, definition: string): string {
  let cleanDef = definition.trim();
  if (cleanDef.endsWith(".")) {
    cleanDef = cleanDef.slice(0, -1);
  }
  
  // Replace "(indica ...)" with "que indica ..."
  cleanDef = cleanDef.replace(/\((indica|expresa|señala|introduce|refiere|equivale)\s+([^)]+)\)/gi, (_match, verb, content) => {
    return `que ${verb} ${content}`;
  });

  let prepended = cleanDef;
  const lower = cleanDef.toLowerCase();
  if (lower.startsWith("preposición")) {
    prepended = "una " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("sustantivo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("adjetivo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("verbo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("determinante")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("pronombre")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("adverbio")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("conjunción")) {
    prepended = "una " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("artículo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else {
    prepended = cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  }

  return `<strong>'${word.toUpperCase()}'</strong>: es ${prepended}.`;
}

function formatPedagogicalExplanation(word: string, definition: string): string {
  let cleanDef = definition.trim();
  if (cleanDef.endsWith(".")) {
    cleanDef = cleanDef.slice(0, -1);
  }
  
  // Replace "(indica ...)" with "que indica ..."
  cleanDef = cleanDef.replace(/\((indica|expresa|señala|introduce|refiere|equivale)\s+([^)]+)\)/gi, (_match, verb, content) => {
    return `que ${verb} ${content}`;
  });

  let prepended = cleanDef;
  const lower = cleanDef.toLowerCase();
  if (lower.startsWith("preposición")) {
    prepended = "una " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("sustantivo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("adjetivo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("verbo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("determinante")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("pronombre")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("adverbio")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("conjunción")) {
    prepended = "una " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else if (lower.startsWith("artículo")) {
    prepended = "un " + cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  } else {
    prepended = cleanDef.slice(0, 1).toLowerCase() + cleanDef.slice(1);
  }

  return `correcta <strong>'${word.toUpperCase()}'</strong>. Es ${prepended}.`;
}

export default function App() {
  // --- WORD POOL PERSISTENCE STATE ---
  const [wordPool, setWordPool] = useState<WordToken[]>(() => {
    try {
      const saved = localStorage.getItem("custom_words_board");
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_WORD_POOL, ...parsed];
      }
    } catch (e) {
      console.error("Error reading custom words from localStorage", e);
    }
    return DEFAULT_WORD_POOL;
  });

  // --- GAME FLOW CONFIG STATE ---
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [boardSize, setBoardSize] = useState<number>(24);
  const [gameDifficulty, setGameDifficulty] = useState<"practice" | "competitive">("competitive");
  const [gameStarted, setGameStarted] = useState(false);

  // Players Name Customization
  const [p1Name, setP1Name] = useState(() => {
    return localStorage.getItem("gramatica_username") || "Tú";
  });
  const [p2Name, setP2Name] = useState("Bot Profesor (Rojo)");

  // Win series tracker
  const [seriesLength, setSeriesLength] = useState<number>(1); // 1, 3, 5
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);

  // Online Multiplayer State
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [onlineRoom, setOnlineRoom] = useState<any>(null);
  const [onlineRole, setOnlineRole] = useState<"host" | "guest" | null>(null);
  const [onlineSecretId, setOnlineSecretId] = useState<string>("");

  // --- INTERACTIVE GAME STATE ---
  const [board, setBoard] = useState<WordToken[]>([]);
  const [player1Cards, setPlayer1Cards] = useState<CardState[]>([]);
  const [player2Cards, setPlayer2Cards] = useState<CardState[]>([]);
  const [player1Secret, setPlayer1Secret] = useState<WordToken | null>(null); // Word P1 must guess (P2's secret)
  const [player2Secret, setPlayer2Secret] = useState<WordToken | null>(null); // Word P2 must guess (P1's secret)
  const [multiLocalSetup, setMultiLocalSetup] = useState<"none" | "p1_choose" | "p2_choose">("none");
  const [currentTurn, setCurrentTurn] = useState<"p1" | "p2">("p1");
  const [winner, setWinner] = useState<"p1" | "p2" | null>(null);

  // Hidden trackers for school mistakes (flipping down correct answers accidentally)
  const [p1Mistakes, setP1Mistakes] = useState<string[]>([]);
  const [p2Mistakes, setP2Mistakes] = useState<string[]>([]);

  // Track failed resolve attempts per player to determine when they have no options left
  const [p1FailedResolves, setP1FailedResolves] = useState<string[]>([]);
  const [p2FailedResolves, setP2FailedResolves] = useState<string[]>([]);

  const [historyList, setHistoryList] = useState<Array<{
    id: string;
    player: "p1" | "p2";
    text: string;
    answer?: "SÍ" | "NO";
    explanation?: string;
    timestamp: string;
  }>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedThisTurn, setHasAskedThisTurn] = useState(false);
  const [pendingLocalQuestion, setPendingLocalQuestion] = useState<{
    text: string;
    askedBy: "p1" | "p2";
    autoAnswer: "SÍ" | "NO";
    explanation: string;
  } | null>(null);
  const [activeBotQuestion, setActiveBotQuestion] = useState<string | null>(null);
  const [askedBotQuestions, setAskedBotQuestions] = useState<string[]>([]);

  const [copiedCode, setCopiedCode] = useState(false);
  const handleCopyCode = () => {
    if (!onlineRoomCode) return;
    navigator.clipboard.writeText(onlineRoomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };
  const handleCancelOnlineRoom = () => {
    setOnlineRoomCode(null);
    setOnlineRoom(null);
    setOnlineRole(null);
    setGameMode("single");
  };

  // --- MODAL & UI VIEWS ---
  const [showSetupTransition, setShowSetupTransition] = useState(false);
  const [isHelperExpanded, setIsHelperExpanded] = useState(true);
  const [showPrintLayout, setShowPrintLayout] = useState(false);
  const [revealP1Secret, setRevealP1Secret] = useState(false);
  const [revealP2Secret, setRevealP2Secret] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [showStartPlayTransition, setShowStartPlayTransition] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveAttemptError, setResolveAttemptError] = useState("");

  // Pizarra Digital Tab view (so Team A and Team B can look at them cleanly on narrow screens)
  const [pizarraActiveTab, setPizarraActiveTab] = useState<"teamA" | "teamB">("teamA");

  // Mobile/Tablet responsive view switcher ("board" shows the board, "helper" shows the question box & history log)
  const [mobileActiveView, setMobileActiveView] = useState<"board" | "helper">("board");

  // Reusable custom confirmation modal to bypass iframe window.confirm limitations
  const [customConfirm, setCustomConfirm] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (
    title: string,
    message: string,
    confirmText: string,
    cancelText: string,
    onConfirm: () => void
  ) => {
    setCustomConfirm({ title, message, confirmText, cancelText, onConfirm });
  };

  // Keep names sync with mode changes (preserving custom name when possible)
  useEffect(() => {
    if (gameMode === "multi_online") return; // sync handles online names

    const savedUsername = localStorage.getItem("gramatica_username");
    if (gameMode === "single") {
      setP1Name(savedUsername || "Tú (Azul)");
      setP2Name("Bot Profesor (Rojo)");
    } else if (gameMode === "multi_local") {
      setP1Name(savedUsername || "Estudiante 1 (Azul)");
      setP2Name("Estudiante 2 (Rojo)");
    } else {
      setP1Name("Equipo A (Azul)");
      setP2Name("Equipo B (Rojo)");
    }
  }, [gameMode]);

  // --- ONLINE MULTIPLAYER HELPERS & LISTENERS ---
  const generateRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const updateOnlineRoom = async (updates: any) => {
    if (!onlineRoomCode) return;
    const path = `online_rooms/${onlineRoomCode}`;
    try {
      const docRef = doc(db, "online_rooms", onlineRoomCode);
      await updateDoc(docRef, cleanUndefined({
        ...updates,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.error("Error updating online room in Firestore: ", e);
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const handleCreateOnlineRoom = async (size: number, diff: "practice" | "competitive", series: number) => {
    setIsLoading(true);
    const code = generateRoomCode();
    const generated = generateBoard(wordPool, size);
    
    const secretIdx1 = Math.floor(Math.random() * generated.length);
    let secretIdx2 = Math.floor(Math.random() * generated.length);
    while (secretIdx2 === secretIdx1 && generated.length > 1) {
      secretIdx2 = Math.floor(Math.random() * generated.length);
    }
    const secret1 = generated[secretIdx1];
    const secret2 = generated[secretIdx2];
    
    const roomDoc = {
      id: code,
      createdAt: Date.now(),
      status: "waiting",
      boardSize: size,
      gameDifficulty: diff,
      seriesLength: series,
      hostName: p1Name,
      guestName: "",
      hostWins: 0,
      guestWins: 0,
      board: generated,
      hostSecret: secret1,
      guestSecret: secret2,
      hostCards: generated.map(b => ({ wordId: b.id, isFlipped: false })),
      guestCards: generated.map(b => ({ wordId: b.id, isFlipped: false })),
      currentTurn: "host",
      winner: null,
      p1Mistakes: [],
      p2Mistakes: [],
      p1FailedResolves: [],
      p2FailedResolves: [],
      historyList: [],
      pendingQuestion: null,
      lastUpdate: Date.now()
    };
    
    try {
      await setDoc(doc(db, "online_rooms", code), cleanUndefined(roomDoc));
      setOnlineRoomCode(code);
      setOnlineRole("host");
      setOnlineRoom(roomDoc);
      setGameMode("multi_online");
    } catch (e) {
      alert("Error al crear la sala en el servidor. Inténtalo de nuevo.");
      console.error(e);
      handleFirestoreError(e, OperationType.CREATE, `online_rooms/${code}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOnlineRoom = async (code: string) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, "online_rooms", code);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert("¡Error! No existe ninguna sala activa con el código " + code);
        setIsLoading(false);
        return;
      }
      const data = docSnap.data();
      if (data.status !== "waiting") {
        alert("¡Error! Esta sala ya está en juego o llena.");
        setIsLoading(false);
        return;
      }
      
      await updateDoc(docRef, cleanUndefined({
        guestName: p1Name,
        status: "playing",
        lastUpdate: Date.now()
      }));
      
      setOnlineRoomCode(code);
      setOnlineRole("guest");
      setOnlineRoom({ ...data, guestName: p1Name, status: "playing" });
      setGameMode("multi_online");
      setGameStarted(true);
    } catch (e) {
      alert("Error al unirse a la sala. Inténtalo de nuevo.");
      console.error(e);
      handleFirestoreError(e, OperationType.GET, `online_rooms/${code}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNextRoundOnline = async () => {
    if (!onlineRoom || !onlineRoomCode) return;
    setIsLoading(true);
    const generated = generateBoard(wordPool, onlineRoom.boardSize);
    
    const secretIdx1 = Math.floor(Math.random() * generated.length);
    let secretIdx2 = Math.floor(Math.random() * generated.length);
    while (secretIdx2 === secretIdx1 && generated.length > 1) {
      secretIdx2 = Math.floor(Math.random() * generated.length);
    }
    const secret1 = generated[secretIdx1];
    const secret2 = generated[secretIdx2];
    
    try {
      await updateDoc(doc(db, "online_rooms", onlineRoomCode), cleanUndefined({
        status: "playing",
        board: generated,
        hostSecret: secret1,
        guestSecret: secret2,
        hostCards: generated.map(b => ({ wordId: b.id, isFlipped: false })),
        guestCards: generated.map(b => ({ wordId: b.id, isFlipped: false })),
        currentTurn: "host",
        winner: null,
        p1Mistakes: [],
        p2Mistakes: [],
        p1FailedResolves: [],
        p2FailedResolves: [],
        historyList: [],
        pendingQuestion: null,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.error(e);
      handleFirestoreError(e, OperationType.UPDATE, `online_rooms/${onlineRoomCode}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSeriesOnline = async () => {
    if (!onlineRoom || !onlineRoomCode) return;
    setIsLoading(true);
    const generated = generateBoard(wordPool, onlineRoom.boardSize);
    
    const secretIdx1 = Math.floor(Math.random() * generated.length);
    let secretIdx2 = Math.floor(Math.random() * generated.length);
    while (secretIdx2 === secretIdx1 && generated.length > 1) {
      secretIdx2 = Math.floor(Math.random() * generated.length);
    }
    const secret1 = generated[secretIdx1];
    const secret2 = generated[secretIdx2];
    
    try {
      await updateDoc(doc(db, "online_rooms", onlineRoomCode), cleanUndefined({
        status: "playing",
        board: generated,
        hostSecret: secret1,
        guestSecret: secret2,
        hostCards: generated.map(b => ({ wordId: b.id, isFlipped: false })),
        guestCards: generated.map(b => ({ wordId: b.id, isFlipped: false })),
        currentTurn: "host",
        winner: null,
        hostWins: 0,
        guestWins: 0,
        p1Mistakes: [],
        p2Mistakes: [],
        p1FailedResolves: [],
        p2FailedResolves: [],
        historyList: [],
        pendingQuestion: null,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.error(e);
      handleFirestoreError(e, OperationType.UPDATE, `online_rooms/${onlineRoomCode}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerOnlineQuestion = async (ans: "SÍ" | "NO", explanation: string) => {
    if (!onlineRoom) return;
    const pq = onlineRoom.pendingQuestion;
    if (!pq) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newHistoryItem = {
      id: `h_${Date.now()}`,
      player: pq.askedBy === "host" ? "p1" : "p2",
      text: pq.text,
      answer: ans,
      explanation: explanation,
      timestamp: time
    };
    
    await updateOnlineRoom({
      pendingQuestion: null,
      historyList: [...(onlineRoom.historyList || []), newHistoryItem],
      currentTurn: pq.askedBy === "host" ? "guest" : "host"
    });
  };

  // Real-time synchronization
  useEffect(() => {
    if (!onlineRoomCode) return;

    const docRef = doc(db, "online_rooms", onlineRoomCode);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOnlineRoom(data);
        
        setBoard(data.board || []);
        setSeriesLength(data.seriesLength || 1);
        setGameDifficulty(data.gameDifficulty || "competitive");
        
        if (onlineRole === "host") {
          setPlayer1Cards(data.hostCards || []);
          setPlayer2Cards(data.guestCards || []);
          setPlayer1Secret(data.hostSecret || null);
          setPlayer2Secret(data.guestSecret || null);
          
          const savedUsername = localStorage.getItem("gramatica_username");
          setP1Name(savedUsername || data.hostName || "Anfitrión");
          setP2Name(data.guestName || "Esperando rival...");
          
          setCurrentTurn(data.currentTurn === "host" ? "p1" : "p2");
          setWinner(data.winner ? (data.winner === "host" ? "p1" : "p2") : null);
          setP1Wins(data.hostWins || 0);
          setP2Wins(data.guestWins || 0);
          
          setP1Mistakes(data.p1Mistakes || []);
          setP2Mistakes(data.p2Mistakes || []);
          
          setP1FailedResolves(data.p1FailedResolves || []);
          setP2FailedResolves(data.p2FailedResolves || []);
        } else if (onlineRole === "guest") {
          setPlayer1Cards(data.guestCards || []);
          setPlayer2Cards(data.hostCards || []);
          setPlayer1Secret(data.guestSecret || null);
          setPlayer2Secret(data.hostSecret || null);
          
          const savedUsername = localStorage.getItem("gramatica_username");
          setP1Name(savedUsername || data.guestName || "Invitado");
          setP2Name(data.hostName || "Anfitrión");
          
          setCurrentTurn(data.currentTurn === "guest" ? "p1" : "p2");
          setWinner(data.winner ? (data.winner === "guest" ? "p1" : "p2") : null);
          setP1Wins(data.guestWins || 0);
          setP2Wins(data.hostWins || 0);
          
          setP1Mistakes(data.p2Mistakes || []);
          setP2Mistakes(data.p1Mistakes || []);
          
          setP1FailedResolves(data.p2FailedResolves || []);
          setP2FailedResolves(data.p1FailedResolves || []);
        }
        
        setHistoryList(data.historyList || []);
        
        if (data.pendingQuestion) {
          const askedByP1 = data.pendingQuestion.askedBy === onlineRole;
          setPendingLocalQuestion({
            text: data.pendingQuestion.text,
            askedBy: askedByP1 ? "p1" : "p2",
            autoAnswer: data.pendingQuestion.autoAnswer,
            explanation: data.pendingQuestion.explanation || ""
          });
        } else {
          setPendingLocalQuestion(null);
        }
        
        if (data.status === "playing" || data.status === "finished") {
          setGameStarted(true);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `online_rooms/${onlineRoomCode}`);
    });

    return () => unsubscribe();
  }, [onlineRoomCode, onlineRole]);

  // Keep track of local series round wins
  useEffect(() => {
    if (gameMode !== "multi_online" && winner) {
      if (winner === "p1") {
        setP1Wins((prev) => prev + 1);
      } else if (winner === "p2") {
        setP2Wins((prev) => prev + 1);
      }
    }
  }, [winner, gameMode]);

  // --- WORD POOL ACTIONS ---
  const handleAddCustomWord = (newWord: WordToken) => {
    const updatedPool = [...wordPool, newWord];
    setWordPool(updatedPool);

    // Save only custom words list to browser storage
    const customList = updatedPool.filter((w) => w.isCustom);
    localStorage.setItem("custom_words_board", JSON.stringify(customList));
  };

  const handleRemoveCustomWord = (id: string) => {
    const updatedPool = wordPool.filter((w) => w.id !== id);
    setWordPool(updatedPool);

    const customList = updatedPool.filter((w) => w.isCustom);
    localStorage.setItem("custom_words_board", JSON.stringify(customList));
  };

  // --- INIT GAME BOARD LOOP ---
  const handleStartGame = () => {
    let finalP1Name = p1Name.trim();
    if (!finalP1Name) {
      if (gameMode === "single") {
        finalP1Name = "Tú (Azul)";
      } else if (gameMode === "multi_local") {
        finalP1Name = "Estudiante 1 (Azul)";
      } else {
        finalP1Name = "Equipo A (Azul)";
      }
      setP1Name(finalP1Name);
    }

    const targetWins = Math.ceil(seriesLength / 2);
    const isSeriesOver = p1Wins >= targetWins || p2Wins >= targetWins;
    if (isSeriesOver) {
      setP1Wins(0);
      setP2Wins(0);
    }

    const generated = generateBoard(wordPool, boardSize);
    setBoard(generated);
    setHasAskedThisTurn(false);
    setPendingLocalQuestion(null);
    setActiveBotQuestion(null);
    setAskedBotQuestions([]);
    setP1FailedResolves([]);
    setP2FailedResolves([]);
    setShowSetupTransition(false);
    setIsHelperExpanded(gameMode === "single");
    
    if (gameMode === "multi_local") {
      setPlayer1Secret(null);
      setPlayer2Secret(null);
      setMultiLocalSetup("p1_choose");
      
      setWinner(null);
      setP1Mistakes([]);
      setP2Mistakes([]);
      setHistoryList([]);
      setCurrentTurn("p1");
      setGameStarted(true);
      setRevealP1Secret(false);
      setRevealP2Secret(false);
      setShowTurnTransition(false);
      setShowResolveModal(false);
      setResolveAttemptError("");
    } else {
      // Choose two distinct random cards to represent secret words
      const secretIdx1 = Math.floor(Math.random() * generated.length);
      let secretIdx2 = Math.floor(Math.random() * generated.length);
      while (secretIdx2 === secretIdx1 && generated.length > 1) {
        secretIdx2 = Math.floor(Math.random() * generated.length);
      }

      const secret1 = generated[secretIdx1]; // Target for P1 to guess (P2's secret)
      const secret2 = generated[secretIdx2]; // Target for P2 to guess (P1's secret)

      setPlayer1Secret(secret1);
      setPlayer2Secret(secret2);

      // Initial states sets
      setPlayer1Cards(generated.map((w) => ({ wordId: w.id, isFlipped: false, isSecret: w.id === secret2.id })));
      setPlayer2Cards(generated.map((w) => ({ wordId: w.id, isFlipped: false, isSecret: w.id === secret1.id })));

      setWinner(null);
      setP1Mistakes([]);
      setP2Mistakes([]);
      setHistoryList([]);
      setCurrentTurn("p1");
      setGameStarted(true);
      setRevealP1Secret(false);
      setRevealP2Secret(false);
      setShowTurnTransition(false);
      setShowResolveModal(false);
      setResolveAttemptError("");
      setMultiLocalSetup("none");
    }
  };

  // --- GAMEPLAY TRIGGERS ---
  const handleToggleFlipCard = (player: "p1" | "p2", wordId: string) => {
    if (gameMode === "multi_online") {
      if (player !== "p1") return; // Can't flip rival's board
      
      const cards = player1Cards;
      const targetSecret = player1Secret;
      const mistakes = p1Mistakes;
      const failed = p1FailedResolves;
      
      const cardsUpdated = cards.map((c) => {
        if (c.wordId === wordId) {
          const nextFlipped = !c.isFlipped;
          
          let updatedMistakes = [...mistakes];
          if (nextFlipped && wordId === targetSecret?.id) {
            if (!mistakes.includes(wordId)) {
              updatedMistakes.push(wordId);
            }
          } else if (!nextFlipped && wordId === targetSecret?.id) {
            updatedMistakes = updatedMistakes.filter((m) => m !== wordId);
          }
          
          let updatedFailedResolves = [...failed];
          if (!nextFlipped) {
            updatedFailedResolves = updatedFailedResolves.filter((id) => id !== wordId);
          }
          
          const nextCards = cards.map(item => item.wordId === wordId ? { ...item, isFlipped: nextFlipped } : item);
          
          if (onlineRole === "host") {
            updateOnlineRoom({
              hostCards: nextCards,
              p1Mistakes: updatedMistakes,
              p1FailedResolves: updatedFailedResolves
            });
          } else {
            updateOnlineRoom({
              guestCards: nextCards,
              p2Mistakes: updatedMistakes,
              p2FailedResolves: updatedFailedResolves
            });
          }
          return { ...c, isFlipped: nextFlipped };
        }
        return c;
      });
      return;
    }

    const cards = player === "p1" ? player1Cards : player2Cards;
    const setCards = player === "p1" ? setPlayer1Cards : setPlayer2Cards;
    const targetSecret = player === "p1" ? player1Secret : player2Secret; // What this player has to guess
    const mistakes = player === "p1" ? p1Mistakes : p2Mistakes;
    const setMistakes = player === "p1" ? setP1Mistakes : setP2Mistakes;

    const updated = cards.map((c) => {
      if (c.wordId === wordId) {
        const nextFlipped = !c.isFlipped;

        // Check if the student is flipping down the actual correct secret!
        if (nextFlipped && wordId === targetSecret?.id) {
          // Accidental exclusion of correct target card!
          if (!mistakes.includes(wordId)) {
            setMistakes([...mistakes, wordId]);
            console.log(`Player ${player} accidentally excluded the solution! Recording mistake.`);
          }
        } else if (!nextFlipped && wordId === targetSecret?.id) {
          // Unflipping it corrects the mistake
          setMistakes(mistakes.filter((m) => m !== wordId));
        }

        // If discovering a card, remove it from failed resolves list
        if (!nextFlipped) {
          if (player === "p1") {
            setP1FailedResolves((prev) => prev.filter((id) => id !== wordId));
          } else {
            setP2FailedResolves((prev) => prev.filter((id) => id !== wordId));
          }
        }

        return { ...c, isFlipped: nextFlipped };
      }
      return c;
    });

    setCards(updated);
  };

  const handleQuestionAsked = (logEntry: string, answer: "SÍ" | "NO", explanation?: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setHistoryList((prev) => [
      ...prev,
      {
        id: `h_${Date.now()}`,
        player: currentTurn,
        text: logEntry,
        answer,
        explanation,
        timestamp: time
      },
    ]);
  };

  const handleAskQuestion = (
    text: string, 
    checkFn?: (wt: WordToken) => { matches: boolean; reason: string }, 
    isCustomAI: boolean = false, 
    customAnswer?: "SÍ" | "NO", 
    customExplanation?: string
  ) => {
    const targetSecret = currentTurn === "p1" ? player1Secret : player2Secret;
    if (!targetSecret) return;

    if (gameMode === "multi_online") {
      const result = checkFn ? checkFn(player1Secret!) : { matches: false, reason: "" };
      const autoAns: "SÍ" | "NO" = result.matches ? "SÍ" : "NO";
      
      updateOnlineRoom({
        pendingQuestion: {
          askedBy: onlineRole,
          text,
          autoAnswer: autoAns,
          explanation: result.reason || "Evaluado automáticamente."
        }
      });
      return;
    }

    if (gameMode === "multi_local") {
      const result = checkFn ? checkFn(targetSecret) : { matches: false, reason: "" };
      const autoAns: "SÍ" | "NO" = result.matches ? "SÍ" : "NO";
      
      setPendingLocalQuestion({
        text,
        askedBy: currentTurn,
        autoAnswer: autoAns,
        explanation: result.reason || "Evaluado localmente."
      });
    } else {
      if (isCustomAI && customAnswer) {
        handleQuestionAsked(text, customAnswer, customExplanation);
      } else {
        const result = checkFn ? checkFn(targetSecret) : { matches: false, reason: "" };
        const ans: "SÍ" | "NO" = result.matches ? "SÍ" : "NO";
        handleQuestionAsked(text, ans, result.reason);
      }
      setHasAskedThisTurn(true);
    }
  };

  // Completes a player turn
  const handleEndTurn = () => {
    setHasAskedThisTurn(false);
    if (gameMode === "single" && currentTurn === "p1") {
      // Transition to AI Bot Turn
      setCurrentTurn("p2");
      simulateBotTurn();
    } else if (gameMode === "multi_local") {
      // Trigger transition masking warning for local 2P
      setShowTurnTransition(true);
    } else if (gameMode === "multi_online") {
      const nextTurn = onlineRole === "host" ? "guest" : "host";
      updateOnlineRoom({
        currentTurn: nextTurn
      });
    } else {
      // Whiteboard pizarra or dual screen toggle turn straight away
      setCurrentTurn(currentTurn === "p1" ? "p2" : "p1");
    }
  };

  // --- BOT SIMULATION INTELLIGENCE ---
  const checkCardMatchesQuestion = (item: WordToken, questionText: string): boolean => {
    // If it's a specific word guess
    if (questionText.startsWith("¿Tu término secreto es '")) {
      const match = questionText.match(/is '([^']+)'/i) || questionText.match(/es '([^']+)'/i);
      const qWord = match ? match[1].toLowerCase() : "";
      return item.word.toLowerCase() === qWord;
    }

    // Evaluate standard query properties
    if (questionText.includes("Sustantivo")) return item.wordClass === WordClass.Sustantivo;
    if (questionText.includes("Adjetivo")) return item.wordClass === WordClass.Adjetivo;
    if (questionText.includes("Verbo")) return item.wordClass === WordClass.Verbo;
    if (questionText.includes("Adverbio")) return item.wordClass === WordClass.Adverbio;
    if (questionText.includes("Preposición")) return item.wordClass === WordClass.Preposicion;
    if (questionText.includes("Pronombre")) return item.wordClass === WordClass.Pronombre;
    if (questionText.includes("Determinante")) return item.wordClass === WordClass.Determinante;
    if (questionText.includes("Conjunción")) return item.wordClass === WordClass.Conjuncion;

    if (questionText.includes("género masculino")) {
      const gen = item.wordClass === WordClass.Sustantivo ? item.attributes.noun?.genero :
                  item.wordClass === WordClass.Adjetivo ? item.attributes.adjective?.genero :
                  item.wordClass === WordClass.Determinante ? item.attributes.det?.genero :
                  item.wordClass === WordClass.Pronombre ? item.attributes.pronoun?.genero : null;
      return gen === "masculino";
    }
    if (questionText.includes("género femenino")) {
      const gen = item.wordClass === WordClass.Sustantivo ? item.attributes.noun?.genero :
                  item.wordClass === WordClass.Adjetivo ? item.attributes.adjective?.genero :
                  item.wordClass === WordClass.Determinante ? item.attributes.det?.genero :
                  item.wordClass === WordClass.Pronombre ? item.attributes.pronoun?.genero : null;
      return gen === "femenino";
    }
    if (questionText.includes("número singular")) {
      const num = item.wordClass === WordClass.Sustantivo ? item.attributes.noun?.numero :
                  item.wordClass === WordClass.Adjetivo ? item.attributes.adjective?.numero :
                  item.wordClass === WordClass.Determinante ? item.attributes.det?.numero :
                  item.wordClass === WordClass.Pronombre ? item.attributes.pronoun?.numero :
                  item.wordClass === WordClass.Verbo ? item.attributes.verb?.numero : null;
      return num === "singular";
    }
    if (questionText.includes("número plural")) {
      const num = item.wordClass === WordClass.Sustantivo ? item.attributes.noun?.numero :
                  item.wordClass === WordClass.Adjetivo ? item.attributes.adjective?.numero :
                  item.wordClass === WordClass.Determinante ? item.attributes.det?.numero :
                  item.wordClass === WordClass.Pronombre ? item.attributes.pronoun?.numero :
                  item.wordClass === WordClass.Verbo ? item.attributes.verb?.numero : null;
      return num === "plural";
    }

    if (questionText.includes("invariable en género")) {
      if (item.wordClass === WordClass.Adverbio || item.wordClass === WordClass.Preposicion || item.wordClass === WordClass.Conjuncion) return true;
      const gen = item.wordClass === WordClass.Sustantivo ? item.attributes.noun?.genero :
                  item.wordClass === WordClass.Adjetivo ? item.attributes.adjective?.genero :
                  item.wordClass === WordClass.Determinante ? item.attributes.det?.genero :
                  item.wordClass === WordClass.Pronombre ? item.attributes.pronoun?.genero : null;
      return gen === "invariable";
    }
    if (questionText.includes("invariable en número")) {
      if (item.wordClass === WordClass.Adverbio || item.wordClass === WordClass.Preposicion || item.wordClass === WordClass.Conjuncion) return true;
      const num = item.wordClass === WordClass.Adjetivo ? item.attributes.adjective?.numero :
                  item.wordClass === WordClass.Determinante ? item.attributes.det?.numero :
                  item.wordClass === WordClass.Pronombre ? item.attributes.pronoun?.numero : null;
      return num === "invariable";
    }

    if (questionText.includes("1ª conjugación")) {
      return item.wordClass === WordClass.Verbo && item.attributes.verb?.conjugacion === "1ª (-ar)";
    }
    if (questionText.includes("2ª conjugación")) {
      return item.wordClass === WordClass.Verbo && item.attributes.verb?.conjugacion === "2ª (-er)";
    }
    if (questionText.includes("3ª conjugación")) {
      return item.wordClass === WordClass.Verbo && item.attributes.verb?.conjugacion === "3ª (-ir)";
    }
    if (questionText.includes("tiempo presente")) {
      return item.wordClass === WordClass.Verbo && item.attributes.verb?.tiempo === "presente";
    }
    if (questionText.includes("tiempo pasado")) {
      return item.wordClass === WordClass.Verbo && item.attributes.verb?.tiempo === "pasado";
    }
    if (questionText.includes("tiempo futuro")) {
      return item.wordClass === WordClass.Verbo && item.attributes.verb?.tiempo === "futuro";
    }

    if (questionText.includes("artículo determinado")) {
      return item.wordClass === WordClass.Determinante && item.attributes.det?.tipoDet === "artículo determinado";
    }
    if (questionText.includes("artículo indeterminado")) {
      return item.wordClass === WordClass.Determinante && item.attributes.det?.tipoDet === "artículo indeterminado";
    }
    if (questionText.includes("determinante demostrativo")) {
      return item.wordClass === WordClass.Determinante && item.attributes.det?.tipoDet === "demostrativo";
    }
    if (questionText.includes("determinante posesivo")) {
      return item.wordClass === WordClass.Determinante && item.attributes.det?.tipoDet === "posesivo";
    }

    if (questionText.includes("pronombre personal")) {
      return item.wordClass === WordClass.Pronombre && item.attributes.pronoun?.tipoPron === "personal";
    }
    if (questionText.includes("pronombre demostrativo")) {
      return item.wordClass === WordClass.Pronombre && item.attributes.pronoun?.tipoPron === "demostrativo";
    }

    if (questionText.includes("adverbio de lugar")) {
      return item.wordClass === WordClass.Adverbio && item.attributes.adverb?.tipoAdv === "lugar";
    }
    if (questionText.includes("adverbio de tiempo")) {
      return item.wordClass === WordClass.Adverbio && item.attributes.adverb?.tipoAdv === "tiempo";
    }
    if (questionText.includes("adverbio de modo")) {
      return item.wordClass === WordClass.Adverbio && item.attributes.adverb?.tipoAdv === "modo";
    }
    if (questionText.includes("adverbio de cantidad")) {
      return item.wordClass === WordClass.Adverbio && item.attributes.adverb?.tipoAdv === "cantidad";
    }

    if (questionText.includes("preposición monosilábica")) {
      return item.wordClass === WordClass.Preposicion && item.attributes.preposition?.tipoPrep === "monosilábica";
    }
    if (questionText.includes("preposición polisilábica")) {
      return item.wordClass === WordClass.Preposicion && item.attributes.preposition?.tipoPrep === "polisilábica";
    }

    if (questionText.includes("conjunción coordinante")) {
      return item.wordClass === WordClass.Conjuncion && item.attributes.conjunction?.tipoConj === "coordinante";
    }
    if (questionText.includes("conjunción subordinante")) {
      return item.wordClass === WordClass.Conjuncion && item.attributes.conjunction?.tipoConj === "subordinante";
    }

    return false;
  };

  const simulateBotTurn = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      // The Bot looks at its remaining cards (player2Cards that are not flipped)
      const remainingCards = player2Cards.filter((c) => !c.isFlipped).map((c) => board.find((b) => b.id === c.wordId)).filter(Boolean) as WordToken[];

      if (remainingCards.length === 0) {
        // Nothing for Bot to check
        setCurrentTurn("p1");
        setIsLoading(false);
        return;
      }

      // If only 1 card remains, the bot wins!
      if (remainingCards.length === 1) {
        setWinner("p2");
        setIsLoading(false);
        return;
      }

      // Candidate dichotomous queries
      const queryCandidates = [
        { type: "class", value: WordClass.Sustantivo, text: `¿Tu término secreto es de la clase Sustantivo?` },
        { type: "class", value: WordClass.Adjetivo, text: `¿Tu término secreto es de la clase Adjetivo?` },
        { type: "class", value: WordClass.Verbo, text: `¿Tu término secreto es de la clase Verbo?` },
        { type: "class", value: WordClass.Adverbio, text: `¿Tu término secreto es de la clase Adverbio?` },
        { type: "class", value: WordClass.Preposicion, text: `¿Tu término secreto es de la clase Preposición?` },
        { type: "class", value: WordClass.Pronombre, text: `¿Tu término secreto es de la clase Pronombre?` },
        { type: "class", value: WordClass.Determinante, text: `¿Tu término secreto es de la clase Determinante?` },
        { type: "class", value: WordClass.Conjuncion, text: `¿Tu término secreto es de la clase Conjunción?` },

        { type: "genero", value: "masculino", text: `¿Tu término secreto es de género masculino?` },
        { type: "genero", value: "femenino", text: `¿Tu término secreto es de género femenino?` },

        { type: "numero", value: "singular", text: `¿Tu término secreto es de número singular?` },
        { type: "numero", value: "plural", text: `¿Tu término secreto es de número plural?` },

        { type: "invariable_genero", value: "si", text: `¿Tu término secreto es invariable en género?` },
        { type: "invariable_numero", value: "si", text: `¿Tu término secreto es invariable en número o no aplicable?` },

        { type: "conjugacion", value: "1ª (-ar)", text: `¿Tu término secreto es un verbo de la 1ª conjugación (-ar)?` },
        { type: "conjugacion", value: "2ª (-er)", text: `¿Tu término secreto es un verbo de la 2ª conjugación (-er)?` },
        { type: "conjugacion", value: "3ª (-ir)", text: `¿Tu término secreto es un verbo de la 3ª conjugación (-ir)?` },
        { type: "tiempo", value: "presente", text: `¿Tu término secreto es un verbo en tiempo presente?` },
        { type: "tiempo", value: "pasado", text: `¿Tu término secreto es un verbo en tiempo pasado?` },
        { type: "tiempo", value: "futuro", text: `¿Tu término secreto es un verbo en tiempo futuro?` },

        { type: "tipoDet", value: "artículo determinado", text: `¿Tu término secreto es un artículo determinado?` },
        { type: "tipoDet", value: "artículo indeterminado", text: `¿Tu término secreto es un artículo indeterminado?` },
        { type: "tipoDet", value: "demostrativo", text: `¿Tu término secreto es un determinante demostrativo?` },
        { type: "tipoDet", value: "posesivo", text: `¿Tu término secreto es un determinante posesivo?` },

        { type: "tipoPron", value: "personal", text: `¿Tu término secreto es un pronombre personal?` },
        { type: "tipoPron", value: "demostrativo", text: `¿Tu término secreto es un pronombre demostrativo?` },

        { type: "tipoAdv", value: "lugar", text: `¿Tu término secreto es un adverbio de lugar?` },
        { type: "tipoAdv", value: "tiempo", text: `¿Tu término secreto es un adverbio de tiempo?` },
        { type: "tipoAdv", value: "modo", text: `¿Tu término secreto es un adverbio de modo?` },
        { type: "tipoAdv", value: "cantidad", text: `¿Tu término secreto es un adverbio de cantidad?` },

        { type: "tipoPrep", value: "monosilábica", text: `¿Tu término secreto es una preposición monosilábica?` },
        { type: "tipoPrep", value: "polisilábica", text: `¿Tu término secreto es una preposición polisilábica?` },

        { type: "tipoConj", value: "coordinante", text: `¿Tu término secreto es una conjunción coordinante?` },
        { type: "tipoConj", value: "subordinante", text: `¿Tu término secreto es una conjunción subordinante?` }
      ];

      // Filter out questions the bot has already asked in this match to avoid loops
      const unaskedCandidates = queryCandidates.filter(q => !askedBotQuestions.includes(q.text));
      const candidatesToUse = unaskedCandidates.length > 0 ? unaskedCandidates : queryCandidates;

      // Score candidates to find which split the remaining cards closest to 50/50
      const scoredCandidates = candidatesToUse.map((q) => {
        const matches = remainingCards.filter(item => checkCardMatchesQuestion(item, q.text));
        const matchCount = matches.length;
        const score = Math.abs(matchCount - (remainingCards.length / 2));
        return { ...q, matchCount, score };
      });

      // Valid questions split the pool into two non-empty groups
      const validQuestions = scoredCandidates.filter(q => q.matchCount > 0 && q.matchCount < remainingCards.length);

      let selectedQuestionText = "";
      if (validQuestions.length === 0) {
        // Fallback: Guess a specific remaining card
        const randomCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        selectedQuestionText = `¿Tu término secreto es '${randomCard.word}'?`;
      } else {
        // Pick the question that offers the best/closest split
        validQuestions.sort((a, b) => a.score - b.score);
        const minScore = validQuestions[0].score;
        const bestQuestions = validQuestions.filter(q => q.score === minScore);
        const chosenQuestion = bestQuestions[Math.floor(Math.random() * bestQuestions.length)];
        
        selectedQuestionText = chosenQuestion.text;
        setAskedBotQuestions((prev) => [...prev, chosenQuestion.text]);
      }

      setActiveBotQuestion(selectedQuestionText);
      setIsLoading(false);
    }, 1200);
  };

  // --- FINAL GUESS RECONCILIATION ---
  const handleResolveGame = (selectedWordId: string) => {
    // CurrentTurn represents who is making the guess
    const targetSecret = currentTurn === "p1" ? player1Secret : player2Secret; // What they are supposed to guess

    if (gameMode === "multi_online") {
      if (selectedWordId === player1Secret?.id) {
        // Correct!
        const nextHostWins = onlineRole === "host" ? (onlineRoom.hostWins || 0) + 1 : (onlineRoom.hostWins || 0);
        const nextGuestWins = onlineRole === "guest" ? (onlineRoom.guestWins || 0) + 1 : (onlineRoom.guestWins || 0);
        
        updateOnlineRoom({
          winner: onlineRole,
          hostWins: nextHostWins,
          guestWins: nextGuestWins,
          status: "finished"
        });
        setShowResolveModal(false);
      } else {
        // Failed
        const guessedWord = board.find(w => w.id === selectedWordId)?.word || "desconocido";
        setResolveAttemptError(`¡Ooh! '${guessedWord.toUpperCase()}' no es el término secreto de tu rival. Sigue investigando las pistas antes de resolver.`);
        
        const updatedFailed = [...p1FailedResolves, selectedWordId];
        if (onlineRole === "host") {
          updateOnlineRoom({
            p1FailedResolves: updatedFailed
          });
        } else {
          updateOnlineRoom({
            p2FailedResolves: updatedFailed
          });
        }
      }
      return;
    }

    if (selectedWordId === targetSecret?.id) {
      // Success! Correct Guess
      setWinner(currentTurn);
      setShowResolveModal(false);
    } else {
      // Failed Guess! Friendly classroom fail
      const guessedWord = board.find(w => w.id === selectedWordId)?.word || "desconocido";
      setResolveAttemptError(`¡Ooh! '${guessedWord.toUpperCase()}' no es el término secreto de tu rival. Sigue investigando las pistas antes de resolver.`);
      
      // Record failed resolve attempt
      if (currentTurn === "p1") {
        if (!p1FailedResolves.includes(selectedWordId)) {
          setP1FailedResolves((prev) => [...prev, selectedWordId]);
        }
      } else {
        if (!p2FailedResolves.includes(selectedWordId)) {
          setP2FailedResolves((prev) => [...prev, selectedWordId]);
        }
      }
    }
  };

  const getFlippedCorrectDetails = (player: "p1" | "p2") => {
    const mistakes = player === "p1" ? p1Mistakes : p2Mistakes;
    const targetSecret = player === "p1" ? player1Secret : player2Secret;
    if (mistakes.length > 0 && targetSecret) {
      return {
        word: targetSecret.word,
        wordClass: targetSecret.wordClass,
        definition: targetSecret.definition
      };
    }
    return null;
  };

  // --- SURRENDER STATE DETERMINATION ---
  const activeCardsForCurrentTurn = currentTurn === "p1" ? player1Cards : player2Cards;
  const failedResolvesForCurrentTurn = currentTurn === "p1" ? p1FailedResolves : p2FailedResolves;

  const availableCardsForCurrentTurn = board.filter((item) => {
    const cardState = activeCardsForCurrentTurn.find((c) => c.wordId === item.id);
    return !cardState?.isFlipped;
  });

  const isSurrenderState = board.length > 0 && (
    availableCardsForCurrentTurn.length === 0 ||
    availableCardsForCurrentTurn.every((item) => failedResolvesForCurrentTurn.includes(item.id))
  );

  const handleSurrender = () => {
    if (gameMode === "multi_online") {
      triggerConfirm(
        "🏳️ ¿Rendirse de la partida?",
        "¿Estás seguro de que deseas rendirte? Se revelará tu término secreto y el oponente ganará la ronda de inmediato.",
        "Sí, Rendirme",
        "No, seguir jugando",
        () => {
          const winnerRole = onlineRole === "host" ? "guest" : "host";
          const nextHostWins = winnerRole === "host" ? (onlineRoom.hostWins || 0) + 1 : (onlineRoom.hostWins || 0);
          const nextGuestWins = winnerRole === "guest" ? (onlineRoom.guestWins || 0) + 1 : (onlineRoom.guestWins || 0);
          
          updateOnlineRoom({
            winner: winnerRole,
            hostWins: nextHostWins,
            guestWins: nextGuestWins,
            status: "finished"
          });
        }
      );
      return;
    }

    triggerConfirm(
      "🏳️ ¿Rendirse de la partida?",
      "¿Estás seguro de que deseas rendirte? Se revelará el término secreto de tu rival y finalizará la partida de inmediato.",
      "Sí, Rendirme",
      "No, seguir jugando",
      () => {
        // Set the opponent as the winner
        setWinner(currentTurn === "p1" ? "p2" : "p1");
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-16 antialiased">
      
      {/* GLOBAL NAVBAR HEADER */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xs no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs">G</div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight leading-none">
              Quién es quién: palabras
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
              El juego para identificar palabras
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {gameStarted && (
            <button
              onClick={() => {
                triggerConfirm(
                  "⚙️ Volver a Ajustes",
                  "¿Seguro que deseas abandonar la partida actual para configurar una nueva?",
                  "Sí, Volver",
                  "No, seguir jugando",
                  () => {
                    setGameStarted(false);
                  }
                );
              }}
              className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
            >
              ⚙️ Volver a Ajustes
            </button>
          )}
          <button
            onClick={() => setShowPrintLayout(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            EXPORTAR PDF
          </button>
        </div>
      </header>

      {/* CORE WRAPPER CONTROLLER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center h-full">
        
        {/* VIEW 1: GAME CONFIG / INITIAL SCREEN */}
        {!gameStarted ? (
          gameMode === "multi_online" && onlineRoomCode && onlineRoom && onlineRoom.status === "waiting" ? (
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-xl text-center select-none my-auto">
              {/* Header */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-200">
                <span className="text-4xl">🌐</span>
                <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 mt-2 uppercase tracking-tight">
                  Sala de Espera Online
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium leading-relaxed font-sans">
                  Tu sala ha sido creada en la nube. Comparte el siguiente código de acceso con tu oponente para jugar en tiempo real.
                </p>
              </div>

              {/* Code display */}
              <div className="flex flex-col items-center bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-slate-800">
                <span className="text-[10px] text-sky-450 text-sky-400 font-mono tracking-widest uppercase font-black">
                  Código de la Sala
                </span>
                
                <div className="text-5xl md:text-6xl font-mono font-black tracking-widest my-3 text-white select-all">
                  {onlineRoomCode}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-[0_3px_0_rgb(14,116,144)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer mt-1"
                >
                  {copiedCode ? (
                    <>
                      <span>✅</span> ¡COPIADO!
                    </>
                  ) : (
                    <>
                      <span>📋</span> COPIAR CÓDIGO
                    </>
                  )}
                </button>
              </div>

              {/* Game details summary */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-left flex flex-col gap-2 font-sans">
                <h4 className="text-xs font-black text-slate-400 uppercase font-mono tracking-wider">
                  Configuración de la Partida:
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-700 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span>📏</span> Tamaño: <strong className="text-slate-900">{onlineRoom.boardSize} fichas</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🧠</span> Dificultad: <strong className="text-slate-900">{onlineRoom.gameDifficulty === "practice" ? "Aula / Práctica" : "Normal"}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span>🏆</span> Serie: <strong className="text-slate-900">{onlineRoom.seriesLength === 1 ? "Partida Única" : `Al mejor de ${onlineRoom.seriesLength}`}</strong>
                  </div>
                </div>
              </div>

              {/* Status spinner / radar */}
              <div className="flex flex-col items-center py-2 font-sans">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-xs font-bold text-slate-600 animate-pulse uppercase tracking-wider font-mono">
                    Esperando a que se una tu rival...
                  </span>
                </div>
                
                <div className="flex justify-between items-center w-full max-w-xs mt-4 p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-500 rounded-full" />
                    <span>Anfitrión: <strong>{onlineRoom.hostName || p1Name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 bg-slate-300 rounded-full" />
                    <span>Invitado: <strong>Esperando...</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={handleCancelOnlineRoom}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all uppercase tracking-wider font-sans"
              >
                ✖ Cancelar y salir
              </button>
            </div>
          ) : (
            <GameSettings
              wordPool={wordPool}
              onAddCustomWord={handleAddCustomWord}
              onRemoveCustomWord={handleRemoveCustomWord}
              boardSize={boardSize}
              setBoardSize={setBoardSize}
              gameMode={gameMode}
              setGameMode={setGameMode}
              gameDifficulty={gameDifficulty}
              setGameDifficulty={setGameDifficulty}
              onStartGame={handleStartGame}
              p1Name={p1Name}
              setP1Name={setP1Name}
              p2Name={p2Name}
              setP2Name={setP2Name}
              onCreateOnlineRoom={handleCreateOnlineRoom}
              onJoinOnlineRoom={handleJoinOnlineRoom}
              seriesLength={seriesLength}
              setSeriesLength={setSeriesLength}
            />
          )
        ) : multiLocalSetup !== "none" ? (
          /* SECRET CHOOSE FLOW FOR LOCAL MULTIPLAYER same terminal */
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-6 md:p-10 flex flex-col gap-6 shadow-xl text-center select-none my-auto">
            <div className="bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl">🤫</span>
              <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 mt-2">
                ELEGIR PALABRA SECRETA (MODO CARA A CARA)
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto font-medium">
                Estáis jugando en el mismo dispositivo. Para evitar trampas, debéis turnaros para elegir de forma secreta el término que vuestro rival tendrá que descubrir.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg md:text-xl font-display font-black text-blue-900 animate-pulse">
                {multiLocalSetup === "p1_choose" ? `👉 Turno de: ${p1Name}` : `👉 Turno de: ${p2Name}`}
              </h3>
              <p className="text-xs md:text-sm text-slate-705 text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed">
                {multiLocalSetup === "p1_choose" 
                  ? `Selecciona el término del tablero que quieres ocultar. '${p2Name}' tendrá que adivinarlo haciendo preguntas cerradas de Sí o No. ¡Pídele a tu compañero que no mire!`
                  : `Selecciona el término del tablero que quieres ocultar. '${p1Name}' tendrá que adivinarlo haciendo preguntas cerradas de Sí o No. ¡Pídele a tu compañero que no mire!`
                }
              </p>
            </div>

            {/* Target choice buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-4 border border-slate-200 rounded-2xl bg-slate-50 no-scrollbar">
              {board.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (multiLocalSetup === "p1_choose") {
                      setPlayer2Secret(item);
                      setMultiLocalSetup("p2_choose");
                      setShowSetupTransition(true);
                    } else {
                      if (player2Secret && player2Secret.id === item.id && board.length > 1) {
                        triggerConfirm(
                          "⚠️ Término Duplicado",
                          "Has elegido el mismo término secreto que tu rival. Por favor, selecciona una palabra diferente para que la partida sea desafiante y divertida.",
                          "Elegir otra palabra",
                          "Volver",
                          () => {}
                        );
                        return;
                      }
                      setPlayer1Secret(item);
                      
                      // Initialize CardState lists
                      setPlayer1Cards(board.map((w) => ({ wordId: w.id, isFlipped: false, isSecret: w.id === item.id })));
                      setPlayer2Cards(board.map((w) => ({ wordId: w.id, isFlipped: false, isSecret: w.id === player2Secret!.id })));
                      
                      setMultiLocalSetup("none");
                      setShowStartPlayTransition(true);
                    }
                  }}
                  className="bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-800 font-bold p-4 rounded-xl text-center capitalize transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  {item.word}
                </button>
              ))}
            </div>

            <div className="mt-2 border-t border-slate-100 pt-4 flex justify-center">
              <button
                onClick={() => {
                  setGameStarted(false);
                  setMultiLocalSetup("none");
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer transition-all"
              >
                ⚙️ Abandonar y volver al menú principal
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: RUNNING ACTIVE GAME */
          <div className="w-full flex flex-col gap-6 no-print">
            
            {/* IN-GAME NOTIFIER BAR */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 relative">
              
              {/* Game indicators */}
              <div className="flex items-center gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold">
                      PARTIDA EN CURSO
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-slate-700">
                      {gameMode === "single" ? "Vs Bot IA" : gameMode === "multi_local" ? "Cara a Cara" : gameMode === "multi_online" ? "En Línea 1vs1" : "Pizarra Digital"}
                    </span>
                    {gameMode === "multi_online" && onlineRoomCode && (
                      <span className="text-xs bg-indigo-600 text-indigo-100 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-indigo-500 font-mono tracking-wider">
                        SALA: {onlineRoomCode}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-display font-black mt-1 text-white">
                    Turno actual: <span className="text-sky-400">{currentTurn === "p1" ? p1Name : p2Name}</span>
                  </h2>
                </div>
              </div>

              {/* Wins Series Tracker Card */}
              <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 text-xs">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-slate-200 text-[10px] leading-none uppercase truncate max-w-[100px]" title={p1Name}>
                    {p1Name}
                  </span>
                  <div className="flex gap-1 mt-1.5">
                    {Array.from({ length: Math.max(1, Math.ceil(seriesLength / 2)) }).map((_, idx) => (
                      <span key={idx} className="text-xs">
                        {idx < p1Wins ? "🔵" : "⚪"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-slate-500 font-black text-sm select-none px-1">VS</div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-slate-200 text-[10px] leading-none uppercase truncate max-w-[100px]" title={p2Name}>
                    {p2Name}
                  </span>
                  <div className="flex gap-1 mt-1.5">
                    {Array.from({ length: Math.max(1, Math.ceil(seriesLength / 2)) }).map((_, idx) => (
                      <span key={idx} className="text-xs">
                        {idx < p2Wins ? "🔴" : "⚪"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Private identity secrets controller */}
              {gameMode !== "multi_local" ? (
                <div className="flex items-center gap-3">
                  <div className="bg-slate-850 border border-slate-700 p-3 rounded-2xl flex flex-col gap-1 items-center min-w-[200px]">
                    <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">
                      Tu término para ocultar es:
                    </span>
                    
                    {/* Identity Reveal Panel (Like the fold-up cards on physical slot) */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setRevealP1Secret(!revealP1Secret)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-[0_3px_0_rgb(180,83,9)] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
                      >
                        {revealP1Secret ? "Ocultar" : "Revelar"}
                      </button>
                      {revealP1Secret && player2Secret && (
                        <span className="text-xs font-bold text-slate-100 capitalize ml-1">
                          {player2Secret.word} <span className="text-[10px] text-sky-350">({player2Secret.wordClass})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* For whiteboard mode */}
                  {gameMode === "pizarra" && (
                    <div className="bg-slate-850 border border-slate-700 p-3 rounded-2xl flex flex-col gap-1 items-center min-w-[200px]">
                      <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">
                        Término de {p2Name}:
                      </span>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setRevealP2Secret(!revealP2Secret)}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-[0_3px_0_rgb(190,24,74)] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
                        >
                          {revealP2Secret ? "Ocultar" : "Revelar"}
                        </button>
                        {revealP2Secret && player1Secret && (
                          <span className="text-xs font-bold text-slate-100 capitalize ml-1">
                            {player1Secret.word} <span className="text-[10px] text-sky-350">({player1Secret.wordClass})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-2"></div>
              )}

              {/* End turn controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerConfirm(
                      "🚪 ¿Salir de la partida?",
                      "¿Seguro que deseas terminar la partida actual y volver al menú inicial? Todo tu progreso actual se perderá.",
                      "Sí, salir",
                      "No, continuar",
                      () => {
                        setGameStarted(false);
                        setMultiLocalSetup("none");
                      }
                    );
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-4 py-3 rounded-xl shadow-[0_4px_0_rgb(159,18,57)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  🚪 Salir
                </button>
                {isSurrenderState ? (
                  <button
                    onClick={handleSurrender}
                    disabled={isLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-[0_4px_0_rgb(190,24,74)] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50 animate-pulse"
                  >
                    🏳️ Me Rindo
                  </button>
                ) : (
                  <button
                    onClick={handleEndTurn}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                  >
                    🏁 Siguiente Turno
                  </button>
                )}
              </div>

            </div>

            {/* ERROR SUMMARY IN GAME ENDED */}
            {winner && (
              <div className="bg-emerald-50 border-4 border-emerald-500 rounded-3xl p-6 shadow-xl text-slate-900 flex flex-col gap-4">
                <div className="text-center">
                  <span className="text-5xl">🏆</span>
                  <h2 className="text-3xl font-display font-black text-emerald-950 mt-2">
                    ¡Tenemos un Ganador!
                  </h2>
                  <p className="text-sm font-semibold text-emerald-800 mt-1 uppercase tracking-widest font-mono">
                    — {winner === "p1" ? p1Name : p2Name} {winner === "p1" && (p1Name.toLowerCase().includes("tú") || p1Name.toLowerCase().includes("tu") || gameMode === "single") ? "has" : "ha"} completado la deducción con éxito —
                  </p>
                </div>

                {/* Pedagogy Mistakes Analysis Recap (The silent correctness safeguard) */}
                <div className="bg-white rounded-2xl p-5 border border-emerald-100 flex flex-col gap-3 mt-2">
                  
                  {/* Player 1 checking */}
                  <div>
                    {p1Mistakes.length > 0 && player1Secret ? (
                      <p className="text-xs text-rose-700 leading-relaxed mt-1">
                        ⚠️ <strong>Atención pedagógica:</strong> Durante la partida, descartaste de forma errónea la palabra <span dangerouslySetInnerHTML={{ __html: formatPedagogicalExplanation(player1Secret.word, player1Secret.definition) }} /> Recuerda repasar las pistas con más atención.
                      </p>
                    ) : winner === "p1" ? (
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        ✅ ¡Excelente deducción! No has descartado la palabra correcta en ningún momento del juego. ¡Matrícula de honor en gramática!
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        💪 ¡Ánimo! No has ganado, pero ibas en la buena dirección. No has descartado la palabra correcta en ningún momento del juego.
                      </p>
                    )}
                  </div>

                  {/* Player 2 checking if not AI */}
                  {gameMode !== "single" && (
                    <div className="border-t border-slate-100 pt-3 mt-1">
                      <h4 className="text-xs font-bold text-slate-950">{p2Name}:</h4>
                      {p2Mistakes.length > 0 && player2Secret ? (
                        <p className="text-xs text-rose-700 leading-relaxed mt-1">
                          ⚠️ <strong>Atención pedagógica:</strong> Durante la partida, descartaste de forma errónea la palabra <span dangerouslySetInnerHTML={{ __html: formatPedagogicalExplanation(player2Secret.word, player2Secret.definition) }} />
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                          ✅ ¡Excelente deducción! No descartó el secreto final.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Words Solutions details */}
                  <div className="border-t border-slate-100 pt-3 mt-1 text-slate-600 text-xs flex flex-col gap-1.5">
                    <p>
                      🗝️ <strong>Solución Secreta del Equipo A:</strong>{" "}
                      {player2Secret ? (
                        <span dangerouslySetInnerHTML={{ __html: formatWordExplanation(player2Secret.word, player2Secret.definition) }} />
                      ) : (
                        "Ninguna"
                      )}
                    </p>
                    <p>
                      🗝️ <strong>Solución Secreta del Equipo B:</strong>{" "}
                      {player1Secret ? (
                        <span dangerouslySetInnerHTML={{ __html: formatWordExplanation(player1Secret.word, player1Secret.definition) }} />
                      ) : (
                        "Ninguna"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-3 mt-4">
                  {gameMode === "multi_online" ? (
                    <>
                      {onlineRole === "host" ? (
                        <>
                          <button
                            onClick={handleStartNextRoundOnline}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all text-sm"
                          >
                            🔄 Siguiente Ronda / Partida
                          </button>
                          <button
                            onClick={handleResetSeriesOnline}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all text-sm"
                          >
                            ♻️ Reiniciar Serie (0-0)
                          </button>
                        </>
                      ) : (
                        <div className="bg-slate-100 border border-slate-200 text-slate-600 font-semibold py-3 px-8 rounded-xl text-sm flex items-center gap-2 animate-pulse justify-center">
                          <span>⏳</span> Esperando que el anfitrión comience la siguiente ronda...
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setOnlineRoomCode(null);
                          setOnlineRole(null);
                          setOnlineRoom(null);
                          setGameStarted(false);
                        }}
                        className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all text-sm"
                      >
                        ⚙️ Salir al Menú Principal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleStartGame}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all text-sm"
                      >
                        🔄 Jugar Otra Vez con Mismos Ajustes
                      </button>
                      <button
                        onClick={() => setGameStarted(false)}
                        className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all text-sm"
                      >
                        ⚙️ Volver a Ajustes / Modificar Fichas
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mobile / Tablet Tab Switcher */}
            <div className="lg:hidden grid grid-cols-2 gap-2 bg-slate-200/55 p-1 rounded-2xl border border-slate-200/80 shadow-2xs mb-2">
              <button
                type="button"
                onClick={() => setMobileActiveView("board")}
                className={`py-3.5 px-4 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mobileActiveView === "board"
                    ? "bg-slate-900 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <span>🗂️</span> Ver Tablero
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveView("helper")}
                className={`py-3.5 px-4 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mobileActiveView === "helper"
                    ? "bg-slate-900 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <span>💡</span> Preguntas e Historial
              </button>
            </div>

            {/* LAYOUT RENDER PRESETS BASED ON CHOSEN MODE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT GRID: DYNAMIC COLUMNS (BOARDS & TABS) */}
              <div className={`lg:col-span-8 flex flex-col gap-6 ${mobileActiveView === "board" ? "block" : "hidden lg:block"}`}>
                
                {/* 1. PIZARRA DIGITAL DOUBLE BOARDS TAB TACTICS */}
                {gameMode === "pizarra" ? (
                  <div className="flex flex-col gap-4">
                    {/* Tabs segment */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPizarraActiveTab("teamA")}
                        className={`flex-1 py-3 font-display font-bold text-center rounded-2xl border-b-4 transition-all cursor-pointer shadow-xs ${
                          pizarraActiveTab === "teamA"
                            ? "bg-slate-900 text-sky-400 border-sky-500"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        🔵 Tablero Equipo A
                      </button>
                      <button
                        onClick={() => setPizarraActiveTab("teamB")}
                        className={`flex-1 py-3 font-display font-bold text-center rounded-2xl border-b-4 transition-all cursor-pointer shadow-xs ${
                          pizarraActiveTab === "teamB"
                            ? "bg-slate-900 text-rose-400 border-rose-500"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        🔴 Tablero Equipo B
                      </button>
                    </div>

                    {/* Active Tab rendering */}
                    {pizarraActiveTab === "teamA" ? (
                      <GameBoard
                        board={board}
                        cardStates={player1Cards}
                        onToggleFlip={(id) => handleToggleFlipCard("p1", id)}
                        secretId={player1Secret?.id || ""}
                        userName={p1Name}
                        accentColor="sky"
                        gameDifficulty={gameDifficulty}
                      />
                    ) : (
                      <GameBoard
                        board={board}
                        cardStates={player2Cards}
                        onToggleFlip={(id) => handleToggleFlipCard("p2", id)}
                        secretId={player2Secret?.id || ""}
                        userName={p2Name}
                        accentColor="rose"
                        gameDifficulty={gameDifficulty}
                      />
                    )}
                  </div>
                ) : (
                  
                  /* 2. STANDARD INDIVIDUAL VS BOT OR PASS-AND-PLAY TURNS */
                  <div className="flex flex-col gap-4">
                    {/* Render Player 1 board on P1 turn */}
                    {currentTurn === "p1" ? (
                      <GameBoard
                        board={board}
                        cardStates={player1Cards}
                        onToggleFlip={(id) => handleToggleFlipCard("p1", id)}
                        secretId={player1Secret?.id || ""}
                        userName={p1Name}
                        accentColor="sky"
                        gameDifficulty={gameDifficulty}
                      />
                    ) : (
                      /* Render Player 2 Board on P2 turn (masked or fully active based on Single vs local 2P) */
                      <GameBoard
                        board={board}
                        cardStates={player2Cards}
                        onToggleFlip={(id) => handleToggleFlipCard("p2", id)}
                        secretId={player2Secret?.id || ""}
                        userName={p2Name}
                        isViewOnly={gameMode === "single"} // Bot controls its own flips behind the scenes in single player mode
                        accentColor="rose"
                        gameDifficulty={gameDifficulty}
                      />
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT GRID: CHAT QUESTIONBOX & HISTORIAL SOLUTIONS */}
              <div className={`lg:col-span-4 flex flex-col gap-6 ${mobileActiveView === "helper" ? "block" : "hidden lg:block"}`}>
                
                {/* Collapsible toggle card (defaults to closed in multi_local and pizarra, and open in single player) */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col gap-3 transition-all no-print">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setIsHelperExpanded(!isHelperExpanded)}
                      className="flex-1 flex items-center justify-between font-display font-black text-slate-800 text-sm md:text-base cursor-pointer hover:text-sky-600 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">💡</span>
                        <span>PREGUNTAS E HISTORIAL</span>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                        {isHelperExpanded ? "Ocultar" : "Mostrar"}
                        <span className="transform transition-transform duration-200 inline-block font-mono">
                          {isHelperExpanded ? "▲" : "▼"}
                        </span>
                      </span>
                    </button>
                    
                    {/* Add a direct Resolve button if folded */}
                    {!isHelperExpanded && (
                      <button
                        onClick={() => setShowResolveModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-[0_3px_0_rgb(109,40,217)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                      >
                        🏆 ¡RESOLVER TÉRMINO!
                      </button>
                    )}
                  </div>

                  {!isHelperExpanded && (
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Este panel se ha plegado automáticamente en este modo de juego. Despliégalo si necesitas ayuda para formular preguntas sobre categorías de palabras o para revisar el historial.
                    </p>
                  )}
                </div>

                {isHelperExpanded && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    {/* Questions box */}
                    <QuestionBox
                      currentTurn={currentTurn}
                      gameMode={gameMode}
                      secretWord={currentTurn === "p1" ? player1Secret! : player2Secret!} // Feed correct answer parameters
                      onQuestionAsked={handleQuestionAsked}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      hasAskedThisTurn={hasAskedThisTurn}
                      onAskQuestion={handleAskQuestion}
                    />

                    {/* History notes table log */}
                    <HistoryLog
                      historyList={historyList}
                      onMakeFinalGuess={() => setShowResolveModal(true)}
                      gameMode={gameMode}
                    />
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* --- MODAL 1: PRINT & EXPORT LAYOUT --- */}
      {showPrintLayout && (
        <PrintLayout
          board={board.length > 0 ? board : wordPool.slice(0, 24)}
          onClose={() => setShowPrintLayout(false)}
        />
      )}

      {/* --- MODAL 2: TURN TRANSITION AND MASK SHEET FOR PASS-AND-PLAY --- */}
      {showTurnTransition && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
            <span className="text-6xl animate-bounce">📱</span>
            <div>
              <h2 className="text-2xl font-display font-bold">¡CAMBIO DE TURNO!</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Pasa el dispositivo a <strong>{currentTurn === "p1" ? p2Name : p1Name}</strong>. 
                Mantén la pantalla oculta de tu compañero para conservar la intriga educativa.
              </p>
            </div>
            
            <button
              onClick={() => {
                const nextTurn = currentTurn === "p1" ? "p2" : "p1";
                setCurrentTurn(nextTurn);
                setShowTurnTransition(false);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all text-sm"
            >
              🔑 Estoy listo, ver mi Tablero
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2.5: SETUP TRANSITION AND MASK SHEET FOR PASS-AND-PLAY SELECTION --- */}
      {showSetupTransition && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
            <span className="text-6xl animate-bounce">📱</span>
            <div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide">¡Pasa el dispositivo!</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Pasa el dispositivo a <strong>{p2Name}</strong>. 
                Debe elegir su término secreto de forma privada. Mantén la pantalla oculta de tu compañero.
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowSetupTransition(false);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-[0_4px_0_rgb(2,132,199)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              ¡Listo! Soy {p2Name} y voy a elegir
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2.7: START PLAY TRANSITION FOR PASS-AND-PLAY --- */}
      {showStartPlayTransition && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
            <span className="text-6xl animate-bounce">⚔️</span>
            <div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide">¡Pasa el dispositivo!</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Ambos estudiantes han elegido sus palabras secretas.
                Pasa el dispositivo de vuelta a <strong>{p1Name}</strong> para iniciar la partida.
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowStartPlayTransition(false);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-[0_4px_0_rgb(2,132,199)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              ¡Listo! Soy {p1Name} y voy a jugar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: FINAL RESOLVE GAME SELECTION --- */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-5 relative border border-slate-100">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-display font-bold text-slate-950">
                🏆 ¡Resolver la palabra secreta!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Selecciona la palabra que crees que es el término oculto de tu rival. ¡Si fallas, la partida continuará!
              </p>
            </div>

            {/* Error status inside resolve */}
            {resolveAttemptError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium">
                ⚠️ {resolveAttemptError}
              </div>
            )}

            {/* Options list: Render non-flipped options on target board */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[250px] p-1">
              {board.map((item) => {
                const activeCards = currentTurn === "p1" ? player1Cards : player2Cards;
                const cardState = activeCards.find((c) => c.wordId === item.id);
                const isFlipped = cardState?.isFlipped || false;

                return (
                  <button
                    key={item.id}
                    disabled={isFlipped}
                    onClick={() => handleResolveGame(item.id)}
                    className={`p-3.5 rounded-xl text-xs font-bold text-center border-2 transition-all cursor-pointer capitalize ${
                      isFlipped
                        ? "bg-slate-50 border-slate-100 text-slate-300 pointer-events-none line-through"
                        : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {item.word}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveAttemptError("");
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 4: PENDING LOCAL RIVAL QUESTION OVERLAY --- */}
      {pendingLocalQuestion && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative border border-slate-200 text-slate-900 text-center animate-scale-up">
            <span className="text-5xl animate-pulse">❓</span>
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 uppercase">
                Pregunta del Rival
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold font-mono">
                — {pendingLocalQuestion.askedBy === "p1" ? p1Name : p2Name} pregunta —
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl">
              <h4 className="text-slate-950 font-black text-sm md:text-base leading-relaxed">
                {pendingLocalQuestion.text}
              </h4>
            </div>

            <div className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto">
              El oponente (<strong>{pendingLocalQuestion.askedBy === "p1" ? p2Name : p1Name}</strong>) debe responder con sinceridad mirando a los ojos de su rival.
              <br />
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full inline-block mt-2">
                🔑 Secreto de {pendingLocalQuestion.askedBy === "p1" ? p2Name : p1Name}: {(pendingLocalQuestion.askedBy === "p1" ? player2Secret : player1Secret)?.word.toUpperCase()}
              </span>
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  const targetSecret = pendingLocalQuestion.askedBy === "p1" ? player2Secret : player1Secret;
                  const proceed = () => {
                    handleQuestionAsked(pendingLocalQuestion.text, "SÍ", pendingLocalQuestion.explanation);
                    setHasAskedThisTurn(true);
                    setPendingLocalQuestion(null);
                  };
                  if (pendingLocalQuestion.autoAnswer === "NO") {
                    triggerConfirm(
                      "⚠️ Advertencia Didáctica",
                      `Tu término secreto es '${targetSecret?.word.toUpperCase()}' (${targetSecret?.wordClass}), que no cumple con la pregunta. ¿Seguro que quieres responder SÍ?`,
                      "Sí, Responder SÍ",
                      "No, Cancelar",
                      proceed
                    );
                  } else {
                    proceed();
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-[0_4px_0_rgb(16,185,129)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                SÍ
              </button>
              <button
                onClick={() => {
                  const targetSecret = pendingLocalQuestion.askedBy === "p1" ? player2Secret : player1Secret;
                  const proceed = () => {
                    handleQuestionAsked(pendingLocalQuestion.text, "NO", pendingLocalQuestion.explanation);
                    setHasAskedThisTurn(true);
                    setPendingLocalQuestion(null);
                  };
                  if (pendingLocalQuestion.autoAnswer === "SÍ") {
                    triggerConfirm(
                      "⚠️ Advertencia Didáctica",
                      `Tu término secreto es '${targetSecret?.word.toUpperCase()}' (${targetSecret?.wordClass}), que sí cumple con la pregunta. ¿Seguro que quieres responder NO?`,
                      "Sí, Responder NO",
                      "No, Cancelar",
                      proceed
                    );
                  } else {
                    proceed();
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-[0_4px_0_rgb(244,63,94)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: ACTIVE BOT QUESTION OVERLAY --- */}
      {activeBotQuestion && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative border-4 border-blue-600 text-slate-900 text-center animate-scale-up">
            <span className="text-5xl animate-bounce">🤖</span>
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 uppercase">
                Pregunta del Bot Profesor
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold font-mono">
                — Responde honestamente para guiar su aprendizaje —
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl">
              <h4 className="text-blue-950 font-black text-sm md:text-base leading-relaxed">
                {activeBotQuestion}
              </h4>
            </div>

            {/* Helper block so the student knows their own word parameters */}
            {player2Secret && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Tu Palabra Secreta Actual:
                </span>
                <span className="text-sm font-black text-blue-900 capitalize">
                  {player2Secret.word} <span className="text-xs text-slate-500">({player2Secret.wordClass})</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  💡 {player2Secret.definition}
                </p>
              </div>
            )}

            {/* User clicks SÍ/NO to respond to the bot */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  const expected = checkCardMatchesQuestion(player2Secret!, activeBotQuestion);

                  const proceed = () => {
                    const userAnswer = "SÍ";
                    
                    // If the bot asked about a specific word and we answered YES, the bot wins!
                    if (activeBotQuestion.startsWith("¿Tu término secreto es '")) {
                      setWinner("p2");
                      setActiveBotQuestion(null);
                      return;
                    }

                    const nextP2Cards = player2Cards.map((c) => {
                      if (c.isFlipped) return c;
                      const item = board.find((b) => b.id === c.wordId);
                      if (!item) return c;
                      // When answering YES, flip cards that do NOT match the criteria
                      if (!checkCardMatchesQuestion(item, activeBotQuestion)) {
                        return { ...c, isFlipped: true };
                      }
                      return c;
                    });
                    setPlayer2Cards(nextP2Cards);

                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    setHistoryList((prev) => [
                      ...prev,
                      {
                        id: `h_${Date.now()}`,
                        player: "p2",
                        text: `Pregunta del Bot: ${activeBotQuestion}`,
                        answer: userAnswer,
                        explanation: `Respondiste que sí. El Bot Profesor ha descartado fichas de su tablero.`,
                        timestamp: time
                      }
                    ]);

                    setActiveBotQuestion(null);
                    setCurrentTurn("p1");
                  };

                  if (!expected) {
                    triggerConfirm(
                      "⚠️ Advertencia Didáctica",
                      `Tu término secreto '${player2Secret?.word.toUpperCase()}' no cumple con esta pregunta. ¿Estás seguro de que quieres responder SÍ?`,
                      "Sí, Responder SÍ",
                      "No, Cancelar",
                      proceed
                    );
                  } else {
                    proceed();
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-[0_4px_0_rgb(16,185,129)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                SÍ
              </button>
              <button
                onClick={() => {
                  const expected = !checkCardMatchesQuestion(player2Secret!, activeBotQuestion);

                  const proceed = () => {
                    const userAnswer = "NO";

                    const nextP2Cards = player2Cards.map((c) => {
                      if (c.isFlipped) return c;
                      const item = board.find((b) => b.id === c.wordId);
                      if (!item) return c;
                      // When answering NO, flip cards that match the criteria (so they are eliminated)
                      if (checkCardMatchesQuestion(item, activeBotQuestion)) {
                        return { ...c, isFlipped: true };
                      }
                      return c;
                    });
                    setPlayer2Cards(nextP2Cards);

                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    setHistoryList((prev) => [
                      ...prev,
                      {
                        id: `h_${Date.now()}`,
                        player: "p2",
                        text: `Pregunta del Bot: ${activeBotQuestion}`,
                        answer: userAnswer,
                        explanation: `Respondiste que no. El Bot Profesor ha descartado fichas de su tablero.`,
                        timestamp: time
                      }
                    ]);

                    setActiveBotQuestion(null);
                    setCurrentTurn("p1");
                  };

                  if (!expected) {
                    triggerConfirm(
                      "⚠️ Advertencia Didáctica",
                      `Tu término secreto '${player2Secret?.word.toUpperCase()}' sí cumple con esta pregunta. ¿Estás seguro de que quieres responder NO?`,
                      "Sí, Responder NO",
                      "No, Cancelar",
                      proceed
                    );
                  } else {
                    proceed();
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-[0_4px_0_rgb(244,63,94)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: REUSABLE CUSTOM CONFIRMATION DIALOG (IFRAME SAFE) --- */}
      {customConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-xs no-print">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-5 border-4 border-amber-400 text-slate-900 text-center animate-scale-up">
            <span className="text-4xl animate-bounce">⚠️</span>
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 uppercase">
                {customConfirm.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed font-semibold">
                {customConfirm.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  setCustomConfirm(null);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                {customConfirm.cancelText}
              </button>
              <button
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-[0_4px_0_rgb(217,119,6)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                {customConfirm.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
