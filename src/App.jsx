import React, { useState } from 'react';

const CHESS_STARS = {
  'Magnus Carlsen': {
    accounts: ['MagnusCarlsen', 'DrNykterstein', 'DrDrunkenstein'],
    description: 'Discover your connection to Magnus Carlsen through Lichess games'
  },
  'Hikaru Nakamura': {
    accounts: ['Hikaru'],
    description: 'Find your connection to Hikaru Nakamura through Lichess games'
  },
  'Alireza Firouzja': {
    accounts: ['alireza2003'],
    description: 'Explore your connection to Alireza Firouzja through Lichess games'
  }
};

// Configurable maximum search depth
const MAX_SEARCH_DEPTH = 5;
const GAMES_PER_USER = 100;


const PathToPlayer = () => {
  const [username, setUsername] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('Magnus Carlsen');
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchUserGames = async (username, depth = 0, visitedPlayers = new Set()) => {
    if (depth > MAX_SEARCH_DEPTH) return null;
    if (visitedPlayers.has(username.toLowerCase())) return null;
    visitedPlayers.add(username.toLowerCase());

    try {
      const userResponse = await fetch(`https://lichess.org/api/user/${username}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const userData = await userResponse.json();

      if (CHESS_STARS[selectedPlayer].accounts.map(a => a.toLowerCase()).includes(username.toLowerCase())) {
        return [{
          username: username,
          rating: userData.perfs?.classical?.rating || 'Unrated'
        }];
      }

      const gamesResponse = await fetch(
        `https://lichess.org/api/games/user/${username}?max=${GAMES_PER_USER}$&perfType=classical`,
        { headers: { 'Accept': 'application/x-ndjson' } }
      );

      if (!gamesResponse.ok) throw new Error('Failed to fetch games');

      const text = await gamesResponse.text();
      const games = text.trim().split('\n').map(line => JSON.parse(line));

      for (const game of games) {
        const opponent = game.players.white.user.name === username ? 
          game.players.black.user.name : 
          game.players.white.user.name;

        const pathThroughOpponent = await fetchUserGames(opponent, depth + 1, new Set(visitedPlayers));
        
        if (pathThroughOpponent) {
          return [{
            username: username,
            rating: userData.perfs?.classical?.rating || 'Unrated'
          }, ...pathThroughOpponent];
        }
      }

      return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const findPath = async () => {
    setLoading(true);
    setError('');
    setPath(null);

    try {
      const foundPath = await fetchUserGames(username);
      if (foundPath) {
        setPath(foundPath);
      } else {
        setError(`No path found within ${MAX_SEARCH_DEPTH} degrees of separation to ${selectedPlayer}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const theme = isDarkMode ? {
    background: '#1a1a1a',
    cardBg: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#404040',
    button: '#4a4a4a',
    buttonHover: '#5a5a5a',
    input: '#333333',
    // link: '#66b3ff',
    // linkHover: '#99ccff'
  } : {
    background: '#f8f4eb',
    cardBg: '#ffffff',
    text: '#2c2c2c',
    textSecondary: '#666666',
    border: '#e8e1d4',
    button: '#826f5d',
    buttonHover: '#6d5c4d',
    input: '#ffffff',
    link: '#6d5c4d',
    linkHover: '#4299e1'
  };

  const styles = {
    container: {
      minHeight: '100vh',
      width: '100vw',
      padding: '2rem',
      backgroundColor: theme.background,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      margin: 0,
      overflow: 'hidden',
    },
    content: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    themeToggle: {
      position: 'absolute',
      right: '2rem',
      top: '2rem',
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      backgroundColor: theme.button,
      border: 'none',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s',
      fontSize: '1.2rem',
    },
    card: {
      backgroundColor: theme.cardBg,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
      fontWeight: 'bold',
      color: theme.text,
      fontFamily: 'serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    selectContainer: {
      position: 'relative',
      display: 'inline-block',
    },
    select: {
      appearance: 'none',
      backgroundColor: 'transparent',
      border: `1px solid ${theme.border}`,
      borderRadius: '0.375rem',
      color: theme.text,
      fontFamily: 'serif',
      fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
      fontWeight: 'bold',
      cursor: 'pointer',
      outline: 'none',
      padding: '0.25rem 2rem 0.25rem 0.5rem',
      marginLeft: '0.5rem',
    },
    selectArrow: {
      position: 'absolute',
      right: '0.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: theme.text,
    },
    description: {
      color: theme.textSecondary,
      marginTop: '0.5rem',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    },
    inputContainer: {
      display: 'flex',
      gap: '1rem',
      width: '100%',
    },
    input: {
      flex: 1,
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.input,
      color: theme.text,
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    },
    button: {
      minWidth: '6rem',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      backgroundColor: theme.button,
      border: 'none',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      '&:hover': {
        backgroundColor: theme.buttonHover,
      },
    },
    error: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '0.375rem',
      color: '#991b1b',
    },
    pathContainer: {
      marginTop: '2rem',
    },
    pathTitle: {
      fontSize: 'clamp(1rem, 3vw, 1.125rem)',
      fontWeight: '500',
      color: theme.text,
      textAlign: 'center',
      fontFamily: 'serif',
      marginBottom: '1.5rem',
    },
    playerCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      backgroundColor: theme.cardBg,
      border: `1px solid ${theme.border}`,
      marginBottom: '1rem',
      position: 'relative',
    },
    knightIcon: {
      width: '2rem',
      height: '2rem',
      backgroundColor: theme.button,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: 'bold',
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      color: theme.text,
      fontWeight: '500',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    },
    playerRating: {
      color: theme.textSecondary,
      fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
    },
    connectionLine: {
      position: 'absolute',
      left: '1rem',
      top: '3rem',
      width: '1px',
      height: '2rem',
      backgroundColor: theme.border,
    },
    link: {
      color: theme.link,
      textDecoration: 'none',
      transition: 'color 0.2s ease, transform 0.2s ease',
      position: 'relative',
      display: 'inline-block',
      padding: '0 2px',
      '&:hover': {
        color: theme.linkHover,
        transform: 'translateY(-1px)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '1px',
        bottom: '-2px',
        left: 0,
        backgroundColor: 'currentColor',
        transform: 'scaleX(0)',
        transformOrigin: 'right',
        transition: 'transform 0.3s ease',
      },
      '&:hover::after': {
        transform: 'scaleX(1)',
        transformOrigin: 'left',
      },
    },
    footer: {
      position: 'absolute',
      bottom: '1rem',
      left: '0',
      right: '0',
      textAlign: 'center',
      fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
      color: theme.textSecondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button 
          style={styles.themeToggle}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.title}>
              Path to{' '}
              <div style={styles.selectContainer}>
                <select 
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  style={styles.select}
                >
                  {Object.keys(CHESS_STARS).map(player => (
                    <option key={player} value={player}>
                      {player}
                    </option>
                  ))}
                </select>
                <span style={styles.selectArrow}>▼</span>
              </div>
            </div>
            <div style={styles.description}>
              {CHESS_STARS[selectedPlayer].description}
            </div>
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="Enter Lichess username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <button 
              onClick={findPath}
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                }}>
                </div>
              ) : (
                "Find"
              )}
            </button>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {path && (
            <div style={styles.pathContainer}>
              <div style={styles.pathTitle}>
                {path.length === 1 ? (
                  `That's ${selectedPlayer}!`
                ) : (
                  `Your ${selectedPlayer} Number: ${path.length - 1}`
                )}
              </div>
              {path.map((player, index) => (
                <div key={player.username}>
                  <div style={styles.playerCard}>
                    <div style={styles.knightIcon}>♘</div>
                    <div style={styles.playerInfo}>
                      <div style={styles.playerName}>
                        {player.username}
                      </div>
                      <div style={styles.playerRating}>
                        Rating: {player.rating}
                      </div>
                    </div>
                  </div>
                  {index < path.length - 1 && (
                    <div style={styles.connectionLine} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={styles.footer}>
        Built by{' '}
        <a 
            href="https://github.com/azariak" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.link}
          >
            Azaria Kelman
          </a>
          {' '}using Claude 3.5 Sonnet.
      </div>
    </div>
  );
};

export default PathToPlayer;