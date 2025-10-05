// Simplified Google Apps Script for Premier Doubles League
// This version fixes the ContentService header chaining issue

const SHEET_ID = '1BKJufbbhpRVRUYXr0O81lTB2iqgHkWluMjuQiGudSL0';

/**
 * Main function to handle HTTP requests
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    let result;
    switch(action) {
      case 'getPlayers':
        result = getPlayers();
        break;
      case 'getTeams':
        result = getTeams();
        break;
      case 'getTeamRosters':
        result = getTeamRosters();
        break;
      case 'getSchedule':
        result = getSchedule();
        break;
      case 'getMatches':
        result = getMatches();
        break;
      case 'getStandings':
        result = getStandings();
        break;
      default:
        result = { error: 'Invalid action', status: 400 };
    }
    
    return createJsonResponse(result);
  } catch (error) {
    console.error('Error in doGet:', error);
    return createJsonResponse({ error: error.toString(), status: 500 });
  }
}

/**
 * Handle POST requests for data updates
 */
function doPost(e) {
  const action = e.parameter.action;
  let data = {};
  
  try {
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
  } catch (parseError) {
    return createJsonResponse({ error: 'Invalid JSON data', status: 400 });
  }
  
  try {
    let result;
    switch(action) {
      case 'updateTeamRosters':
        result = updateTeamRosters(data);
        break;
      case 'addMatchResult':
        result = addMatchResult(data);
        break;
      case 'updateSchedule':
        result = updateSchedule(data);
        break;
      default:
        result = { error: 'Invalid action', status: 400 };
    }
    
    return createJsonResponse(result);
  } catch (error) {
    console.error('Error in doPost:', error);
    return createJsonResponse({ error: error.toString(), status: 500 });
  }
}

/**
 * Create a JSON response (simplified to avoid header chaining issues)
 */
function createJsonResponse(data) {
  const response = {
    status: data.status || 200,
    data: data.status ? { error: data.error } : data,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get all players from PDL Players sheet
 */
function getPlayers() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('PDL Players');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { players: [] };
    }
    
    const players = data.slice(1)
      .filter(row => row[1] && row[2] && row[3]) // Filter out empty rows
      .map((row, index) => {
        return {
          id: index + 1,
          memberNumber: row[1] || '',
          firstName: row[2] || '',
          lastName: row[3] || '',
          name: `${row[2]} ${row[3]}`.trim(),
          email: row[4] || '',
          phone: row[5] || '',
          isPaid: row[6] === 'Yes',
          age: row[7] || '',
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
        };
      });
      
    return { players };
  } catch (error) {
    console.error('Error getting players:', error);
    return { players: [] };
  }
}

/**
 * Get team information from Teams sheet
 */
function getTeams() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Teams');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      // Return default teams if sheet is empty
      return {
        teams: [
          { teamNo: 1, teamName: "The Expendaballs", teamShortName: "EX" },
          { teamNo: 2, teamName: "Spin Doctors", teamShortName: "SD" },
          { teamNo: 3, teamName: "Hit for Brains", teamShortName: "HB" },
          { teamNo: 4, teamName: "Cereal Killers", teamShortName: "CK" },
          { teamNo: 5, teamName: "Chafing the Dream", teamShortName: "CD" }
        ]
      };
    }
    
    const teams = data.slice(1)
      .filter(row => row[0]) // Filter out empty rows
      .map(row => ({
        teamNo: row[0],
        teamName: row[1] || '',
        teamShortName: row[2] || ''
      }));
      
    return { teams };
  } catch (error) {
    console.error('Error getting teams:', error);
    return { teams: [] };
  }
}

/**
 * Get team rosters from Team Rosters sheet
 */
function getTeamRosters() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Team Rosters');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { rosters: [] };
    }
    
    const rosters = data.slice(1)
      .filter(row => row[0]) // Filter out empty rows
      .map(row => ({
        rosterNo: row[0],
        teamNo: row[1],
        teamName: row[2] || '',
        positionNo: row[3] || '',
        leftWaller: row[4] || '',
        rightWaller: row[5] || '',
        teamPlayers: row[6] || ''
      }));
      
    return { rosters };
  } catch (error) {
    console.error('Error getting team rosters:', error);
    return { rosters: [] };
  }
}

/**
 * Get schedule and results from Schedule_Result sheet
 */
function getSchedule() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Schedule_Result');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { schedule: [] };
    }
    
    const schedule = data.slice(1)
      .filter(row => row[0]) // Filter out empty rows
      .map(row => ({
        scheduleNo: row[0],
        week: row[1] || '',
        position: row[2] || '',
        teamA: row[3] || '',
        teamB: row[4] || '',
        dateTime: row[5] || '',
        endTime: row[6] || '',
        teamAPlayers: row[7] || '',
        teamBPlayers: row[8] || '',
        teamA1: row[9] || '',
        teamB1: row[10] || '',
        teamA2: row[11] || '',
        teamB2: row[12] || '',
        teamA3: row[13] || '',
        teamB3: row[14] || '',
        teamA4: row[15] || '',
        teamB4: row[16] || '',
        teamA5: row[17] || '',
        teamB5: row[18] || '',
        gamesWonA: parseInt(row[19]) || 0,
        gamesWonB: parseInt(row[20]) || 0,
        completed: row[21] === true || row[21] === 'true' || row[21] === 'TRUE'
      }));
      
    return { schedule };
  } catch (error) {
    console.error('Error getting schedule:', error);
    return { schedule: [] };
  }
}

/**
 * Get match results (processed from schedule data)
 */
function getMatches() {
  try {
    const scheduleData = getSchedule();
    const matches = {};
    
    scheduleData.schedule.forEach(match => {
      if (match.completed) {
        matches[`match_${match.scheduleNo}`] = {
          scheduleNo: match.scheduleNo,
          gamesWonA: match.gamesWonA,
          gamesWonB: match.gamesWonB,
          completed: true,
          gameResults: [
            { teamA: match.teamA1, teamB: match.teamB1 },
            { teamA: match.teamA2, teamB: match.teamB2 },
            { teamA: match.teamA3, teamB: match.teamB3 },
            { teamA: match.teamA4, teamB: match.teamB4 },
            { teamA: match.teamA5, teamB: match.teamB5 }
          ].filter(game => game.teamA !== '' && game.teamB !== '')
        };
      }
    });
    
    return { matches };
  } catch (error) {
    console.error('Error getting matches:', error);
    return { matches: {} };
  }
}

/**
 * Get calculated standings
 */
function getStandings() {
  try {
    // Try to get standings from sheet first
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Standings');
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 1) {
      const standings = data.slice(1)
        .filter(row => row[0]) // Filter out empty rows
        .map(row => ({
          teamName: row[0] || '',
          matches: parseInt(row[1]) || 0,
          wins: parseInt(row[2]) || 0,
          losses: parseInt(row[3]) || 0,
          gamesWon: parseInt(row[4]) || 0,
          gamesLost: parseInt(row[5]) || 0,
          points: parseInt(row[6]) || 0,
          winPercentage: parseFloat(row[7]) || 0
        }));
        
      return { standings };
    }
  } catch (error) {
    console.log('No standings sheet or error reading it, calculating from results');
  }
  
  // Calculate standings from match results
  return calculateStandingsFromResults();
}

/**
 * Calculate standings from match results
 */
function calculateStandingsFromResults() {
  try {
    const scheduleData = getSchedule();
    const teamsData = getTeams();
    
    const standings = teamsData.teams.map(team => ({
      teamNo: team.teamNo,
      teamName: team.teamName,
      matches: 0,
      wins: 0,
      losses: 0,
      gamesWon: 0,
      gamesLost: 0,
      points: 0,
      winPercentage: 0
    }));
    
    // Process completed matches
    scheduleData.schedule.filter(match => match.completed).forEach(match => {
      const teamAIndex = standings.findIndex(s => 
        s.teamName === match.teamA || s.teamName.includes(match.teamA)
      );
      const teamBIndex = standings.findIndex(s => 
        s.teamName === match.teamB || s.teamName.includes(match.teamB)
      );
      
      if (teamAIndex >= 0 && teamBIndex >= 0) {
        standings[teamAIndex].matches++;
        standings[teamBIndex].matches++;
        standings[teamAIndex].gamesWon += match.gamesWonA;
        standings[teamAIndex].gamesLost += match.gamesWonB;
        standings[teamBIndex].gamesWon += match.gamesWonB;
        standings[teamBIndex].gamesLost += match.gamesWonA;
        
        if (match.gamesWonA > match.gamesWonB) {
          standings[teamAIndex].wins++;
          standings[teamAIndex].points += 2;
          standings[teamBIndex].losses++;
        } else {
          standings[teamBIndex].wins++;
          standings[teamBIndex].points += 2;
          standings[teamAIndex].losses++;
        }
      }
    });
    
    // Calculate win percentages and sort
    standings.forEach(team => {
      team.winPercentage = team.matches > 0 ? 
        parseFloat((team.wins / team.matches * 100).toFixed(1)) : 0;
    });
    
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.gamesWon - a.gamesWon;
    });
    
    return { standings };
  } catch (error) {
    console.error('Error calculating standings:', error);
    return { standings: [] };
  }
}

/**
 * Update team rosters in the sheet
 */
function updateTeamRosters(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Team Rosters');
    
    // Clear existing data (keep headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Add new roster data
    const rosters = data.rosters || [];
    if (rosters.length > 0) {
      const rows = rosters.map(roster => [
        roster.rosterNo || '',
        roster.teamNo || '',
        roster.teamName || '',
        roster.positionNo || '',
        roster.leftWaller || '',
        roster.rightWaller || '',
        roster.teamPlayers || ''
      ]);
      
      sheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }
    
    return { success: true, message: 'Team rosters updated successfully' };
  } catch (error) {
    console.error('Error updating team rosters:', error);
    return { error: 'Failed to update team rosters: ' + error.toString(), status: 500 };
  }
}

/**
 * Add or update match result
 */
function addMatchResult(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Schedule_Result');
    const scheduleData = sheet.getDataRange().getValues();
    
    const matchIndex = scheduleData.findIndex(row => row[0] == data.scheduleNo);
    
    if (matchIndex > 0) { // Found the match (index 0 is headers)
      const row = matchIndex + 1; // Convert to 1-based indexing for sheets
      
      // Update individual game scores if provided
      const gameResults = data.gameResults || [];
      gameResults.forEach((game, index) => {
        if (index < 5) { // Only 5 games max
          const teamAColIndex = 9 + index * 2; // Columns J, L, N, P, R (0-based: 9, 11, 13, 15, 17)
          const teamBColIndex = 10 + index * 2; // Columns K, M, O, Q, S (0-based: 10, 12, 14, 16, 18)
          
          sheet.getRange(row, teamAColIndex + 1).setValue(game.teamA || '');
          sheet.getRange(row, teamBColIndex + 1).setValue(game.teamB || '');
        }
      });
      
      // Update totals and completion status
      sheet.getRange(row, 20).setValue(data.gamesWonA || 0); // Column T
      sheet.getRange(row, 21).setValue(data.gamesWonB || 0); // Column U
      sheet.getRange(row, 22).setValue(true); // Column V (completed)
      
      return { success: true, message: 'Match result updated successfully' };
    } else {
      return { error: 'Match not found', status: 404 };
    }
  } catch (error) {
    console.error('Error adding match result:', error);
    return { error: 'Failed to add match result: ' + error.toString(), status: 500 };
  }
}

/**
 * Update schedule with new matches
 */
function updateSchedule(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Schedule_Result');
    
    // Clear existing data (keep headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Add new schedule data
    const schedule = data.schedule || [];
    if (schedule.length > 0) {
      const rows = schedule.map(match => [
        match.scheduleNo || '',
        match.week || '',
        match.position || '',
        match.teamA || '',
        match.teamB || '',
        match.dateTime || '',
        match.endTime || '',
        match.teamAPlayers || '',
        match.teamBPlayers || '',
        '', '', '', '', '', '', '', '', '', '', // Game scores (empty initially)
        0, // games_won_a
        0, // games_won_b
        false // completed
      ]);
      
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    return { success: true, message: 'Schedule updated successfully' };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return { error: 'Failed to update schedule: ' + error.toString(), status: 500 };
  }
}

/**
 * Test function to verify the script works
 */
function testScript() {
  console.log('Testing script...');
  
  try {
    const playersResponse = getPlayers();
    console.log('Players response:', playersResponse);
    
    const teamsResponse = getTeams();
    console.log('Teams response:', teamsResponse);
    
    const rostersResponse = getTeamRosters();
    console.log('Rosters response:', rostersResponse);
    
    console.log('Script test completed successfully!');
    return 'Test completed successfully';
  } catch (error) {
    console.error('Test failed:', error);
    return 'Test failed: ' + error.toString();
  }
}