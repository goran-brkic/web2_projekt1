var express = require('express');
var router = express.Router();
const pool = require("../db");

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect('/1');
});

router.get("/auth_config.json", function (req, res) {
  res.json({
      "domain": "https://dev-7xjdvaspwt881ruz.eu.auth0.com",
      "clientId": process.env.SPA_CLIENT_ID,
      "audience": 'https://sahliga.com'
  });
});

router.post('/:num_of_round', async (req, res) => {
  
  if(req.body._method == "PUT") {
    // UPDATE
    if(req.body.comment_id) {
      // UPDATE A COMMENT
      query = await pool.query(`UPDATE comment SET text = '${req.body.text}' WHERE comment_id = ${req.body.comment_id}`);
    } else if(req.body.id_game) {
      // UPDATE A GAME
      if(req.body.editedScore == "Draw" || req.body.editedScore == "draw"){
        query = await pool.query(`UPDATE game SET id_winner = null WHERE id_game = ${req.body.id_game}`);
      } else {
        console.log(req.body)
        let firstName = String(req.body.editedScore).split(" ");
        firstName = firstName[0];
        idWinner = await pool.query(`SELECT id_player FROM player WHERE player_firstname = '${firstName}' `)
        idWinner = idWinner.rows[0].id_player
        console.log(idWinner);
        console.log(req.body.id_game)
        query = await pool.query(`UPDATE game SET id_winner = ${idWinner} WHERE id_game = ${req.body.id_game}`);
        console.log("zavrsio i s tim")
      }
    }

  } else if (req.body._method == "DELETE") {
      query = await pool.query(`DELETE FROM comment WHERE comment_id = ${req.body.comment_id}`)
  } else {
    //let userid = await pool.query(`SELECT user_id FROM person WHERE email='${req.body.username}'`)
    query = await pool.query(`INSERT INTO comment (user_id, round_num, text, date_posted) VALUES ('${req.body.username}', ${req.params.num_of_round}, '${req.body.comment}', current_timestamp)`)
  }
  res.redirect('/');
})


router.get('/:num_of_round', async function(req, res, next) {
  queryresult1 = await pool.query(`SELECT game.round_num, game.id_game, p1.player_firstname AS player1_firstname, p1.player_lastname AS player1_lastname, 
                                  p2.player_firstname AS player2_firstname, p2.player_lastname AS player2_lastname, 
                                  winner.player_firstname AS winner_firstname, winner.player_lastname AS winner_lastname
                                  FROM game 
                                  LEFT JOIN player AS p1 ON game.id_player1 = p1.id_player
                                  LEFT JOIN player AS p2 ON game.id_player2 = p2.id_player
                                  LEFT JOIN player AS winner ON game.id_winner = winner.id_player
                                  WHERE round_num = ${req.params.num_of_round}`);
  num_of_rounds = await pool.query(`SELECT COUNT(DISTINCT round_num) FROM game`);
  num_of_rounds = num_of_rounds.rows[0].count

  comments = await pool.query(`SELECT * FROM comment WHERE round_num=${req.params.num_of_round}`);
  comments = comments.rows;

  res.render('index', { title: 'SahLiga', games: queryresult1.rows, num_of_rounds, num_of_round: req.params.num_of_round, comments });
});



module.exports = router;
