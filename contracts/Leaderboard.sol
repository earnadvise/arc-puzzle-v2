// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Leaderboard {
    struct ScoreEntry {
        address user;
        string username;
        uint256 score;
        uint256 timestamp;
    }

    ScoreEntry[] public scores;
    uint256 public constant MAX_LEADERBOARD_SIZE = 10;

    event ScoreSubmitted(address indexed user, string username, uint256 score);

    function submitScore(string memory _username, uint256 _score) public {
        scores.push(ScoreEntry({
            user: msg.sender,
            username: _username,
            score: _score,
            timestamp: block.timestamp
        }));

        // Sort the scores in descending order (simple insertion sort for small array)
        _sortScores();

        // Keep only top 10
        if (scores.length > MAX_LEADERBOARD_SIZE) {
            scores.pop();
        }

        emit ScoreSubmitted(msg.sender, _username, _score);
    }

    function _sortScores() internal {
        uint n = scores.length;
        for (uint i = 1; i < n; i++) {
            ScoreEntry memory key = scores[i];
            int j = int(i) - 1;
            while (j >= 0 && scores[uint(j)].score < key.score) {
                scores[uint(j) + 1] = scores[uint(j)];
                j--;
            }
            scores[uint(j) + 1] = key;
        }
    }

    function getTopScores() public view returns (ScoreEntry[] memory) {
        return scores;
    }

    function getScoresCount() public view returns (uint256) {
        return scores.length;
    }
}
