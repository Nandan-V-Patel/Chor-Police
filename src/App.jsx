import { useGameState } from './hooks/useGameState';
import HomeScreen from './components/HomeScreen';
import Lobby from './components/Lobby';
import RoleConfiguration from './components/RoleConfiguration';
import RoleReveal from './components/RoleReveal';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import ConfirmationModal from './components/ConfirmationModal';

export default function App() {
  const {
    state,
    goHome,
    goLobby,
    goConfig,
    returnToLobby,
    showRefreshConfirm,
    confirmRefreshToLobby,
    cancelRefreshConfirm,
    addPlayer,
    removePlayer,
    setAllocationMode,
    setConfiguredChors,
    startGame,
    markRevealed,
    nextReveal,
    finishReveal,
    selectPlayer,
    eliminatePlayer,
    restartGame,
    newGameFromVictory,
  } = useGameState();

  let screen;
  switch (state.gamePhase) {
    case 'home':
      screen = <HomeScreen onCreateGame={goLobby} />;
      break;

    case 'lobby':
      screen = (
        <Lobby
          players={state.players}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onContinue={goConfig}
          onBack={goHome}
        />
      );
      break;

    case 'config':
      screen = (
        <RoleConfiguration
          players={state.players}
          allocationMode={state.allocationMode}
          configuredChors={state.configuredChors}
          onSetAllocationMode={setAllocationMode}
          onSetConfiguredChors={setConfiguredChors}
          onStartGame={startGame}
          onBack={goLobby}
        />
      );
      break;

    case 'reveal':
      screen = (
        <RoleReveal
          players={state.players}
          currentRevealIndex={state.currentRevealIndex}
          revealedPlayers={state.revealedPlayers || {}}
          onMarkRevealed={markRevealed}
          onNextReveal={nextReveal}
          onFinishReveal={finishReveal}
        />
      );
      break;

    case 'game':
      screen = (
        <GameScreen
          players={state.players}
          selectedPlayerId={state.selectedPlayerId}
          gameStatus={state.gameStatus}
          onSelectPlayer={selectPlayer}
          onEliminatePlayer={eliminatePlayer}
          onRestart={restartGame}
          onBackToLobby={returnToLobby}
        />
      );
      break;

    case 'victory':
      screen = (
        <VictoryScreen
          gameStatus={state.gameStatus}
          victoryReason={state.victoryReason}
          players={state.players}
          onNewGame={newGameFromVictory}
          onBackToLobby={returnToLobby}
        />
      );
      break;

    default:
      screen = <HomeScreen onCreateGame={goLobby} />;
  }

  return (
    <>
      {screen}
      <ConfirmationModal
        isOpen={showRefreshConfirm}
        title="Refresh detected"
        message="Go to the lobby without preserving player names or the current game?"
        cancelLabel="Keep Current Game"
        confirmLabel="Go to Empty Lobby"
        confirmVariant="danger"
        onCancel={cancelRefreshConfirm}
        onConfirm={confirmRefreshToLobby}
      />
    </>
  );
}
