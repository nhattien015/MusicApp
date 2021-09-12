const express = require("express");
const router = express.Router();
const musicdata = require("../../data/data")
const mysql = require("mysql");
const musiclist = require("../../data/musiclist.js");
const categorydata = require("../../data/categorydata");
const db = require("../../databases/DatabaseConnection");
const {connectDB} = require("../../databases/DatabaseConnection");
const crypto = require('crypto');
const slug = require('slug');
const capitalize = require('../../javascript-functions/capitalize.js')
// router.get("/database/createmusictable",(req, res)=>{
//   let sql = "CREATE TABLE music(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, title text, audio text, artist_name text DEFAULT 'Unknown', cat_id int, cat_name text, public_year int DEFAULT '2021', lyrics text, artist_id int, upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(artist_id) REFERENCES artist(id), FOREIGN KEY(cat_id) REFERENCES category(id))";
//   db.query(sql,(err, result) =>{
//       if(err) throw err;
//       console.log(result);
//       res.send("Music table was created");
//   })

// })

// router.get("/database/createcategorytable",(req,res)=>{
//   let sql = "CREATE TABLE category(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, title text)";
//   db.query(sql,(err, result)=>{
//     if(err) throw err;
//     console.log(result);
//     res.send("Category table created...");
//   })
// })

// router.get("/database/createartisttable",(req,res)=>{
//   let sql = "CREATE TABLE artist(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, title text)"
//   db.query(sql,(err, result)=>{
//     if(err) throw err;
//     console.log(result);
//     res.send("Artist table created...");
//   })
// })
// router.get("/database/createusertable",(req,res)=>{
//   let sql = "CREATE TABLE user(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, displayedName VARCHAR(100), avatar TEXT DEFAULT 'defaultavatar.png')"
//   db.query(sql,(err, result)=>{
//     if(err) throw err;
//     console.log(result);
//     res.send("User table created...");
//   })
// })

// router.get("/database/createresetpasswordtable", (req, res) => {
//   let sql = "CREATE TABLE resetpassword(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, selector TEXT, token TEXT, useremail TEXT)";
//   db.query(sql,(err, result)=>{
//     if(err) throw err;
//     console.log(result);
//     res.send("resetpassword table created...");
//   })
// })
// router.get('/database/createalbumtable',(req,res)=>{
//   let sql = "CREATE TABLE album(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, title TEXT DEFAULT 'Album is not named', artist_id int, cat_id int, FOREIGN KEY(cat_id) REFERENCES music(cat_id),FOREIGN KEY(artist_id) REFERENCES music(artist_id))";
//   db.query(sql,(err, result)=>{
//     if(err) throw err;
//     console.log(result);
//     res.send("album table was created done!");
//   })
// })
router.get('/database/insertmusicfromapiintodatabase', async (req, res)=>{
  musics = musicdata.music
  musics.forEach(async (music) => {
    let slugData;
    let sqlSelectSlug;
    let isDuplicate = true;
    
    while(isDuplicate){
      slugData = `${slug(music.title,"-")}.${crypto.randomBytes(6).toString('hex')}`;
      sqlSelectSlug = `SELECT * FROM music WHERE slug='${slugData}'`; //Check duplicate
      try{
        let result = await db.query(sqlSelectSlug)
        if(result.length === 0){
          isDuplicate = false;
        }      
      }
      catch(err){
        console.log(err);
      }
      
      
    }  
  
    
    insertSql = `INSERT music(title,cat_name,artist_name,lyrics,audio, thumbnail, slug) VALUES("${music.title}","${music.cat_name}","${music.artist_name}","${mysql.escape(music.lyrics)}", "${music.mp3}", "${music.thumbnail}", "${slugData}")`
    try{
      let result = await db.query(insertSql);
      res.send(result);
    }
    catch(err){
      console.log(err);
      res.send("Error")
    }
  });
  
})

router.get('/database/insertcategoryfromapiintodatabase',async (req, res)=>{
  let sql = ""
  categorydata.forEach(async (cat) => {
    
    let sqlcheckduplicate = `SELECT * FROM category WHERE title="${cat.title}"`;
    let sqlInsertCategory = `INSERT category(title,slug) VALUES("${cat.title}","${slug(cat.title)}")`;
    console.log(sqlcheckduplicate,sqlInsertCategory)
    try{
      let result = await db.query(sqlcheckduplicate);
      if(result.length === 0){
        try{
          let result = await db.query(sqlInsertCategory);
          console.log(result);
          res.send(result);
        }catch(err){

        }
      }
    }
    catch(err){
      console.log(err);
    }
    

  });
  
})

router.get('/database/mapartistfrommusictoartistable',async (req, res)=>{

  let sql = "SELECT artist_name FROM music";
  
  let artistArray = []
  let result = await db.query(sql);
  result.forEach(item => {
    artistArray.push(item.artist_name.toString().toLowerCase());
  })
  console.log(artistArray);
  let artistSet = new Set(artistArray)
  artistArray = Array.from(artistSet).map(capitalize);
  artistArray.forEach(async (artistname)=> {
    let isDuplicated = true;
    let slugData = "";
    let sqlSelectSlug;

    while(isDuplicated){
      slugData = `${slug(artistname,'-')}`;
      sqlSelectSlug = `SELECT slug FROM artist WHERE slug='${slugData}'`;
      try{
        let result = await db.query(sqlSelectSlug);
        if(result.length === 0){
          isDuplicated = false;
        }
      }
      catch(err){
        console.log(err);
      }
    }
    // Check duplicate artist name
    try{
        let result = await db.query(`SELECT title FROM artist WHERE title ='${artistname}'`)
        if(result.length === 0){
          try{
            let result = await db.query(`INSERT artist(title,slug) VALUEs("${artistname}", '${slugData}')`);
            res.send(result);
          }
          catch(err){
            console.log(err);
          }
        }
    }catch(err){
      console.log(err);
    }
    //insert final valuie
    

  })  
    
    // Array.from(artists).forEach(artist=>{
    //   db.query(`INSERT artist(title) VALUEs("${artist.title}")`,(err,result)=>{
    //     if(err) throw err;
    //     console.log(result)
    //   })
    // })
  })
  
// router.get('/database/mapartistidtomusictable',async (req,res,next)=>{
//     let sqlArtist = `SELECT * FROM artist`;
//     let sqlInsertToMusic;
//     try{
//       let resultArtist = await db.query(sqlArtist);
//       Array.from(resultArtist).forEach( async (artist)=>{
//         sqlInsertToMusic = `UPDATE music SET artist_id = ${artist.id} WHERE artist_name = '${artist.title}'`;

//         try{
//           let result = await db.query(sqlInsertToMusic);
//           console.log(result);
//         }
//         catch(err){
//           console.log(err);
//         }
//       })
//     }
//     catch(err){
//       console.log(err);
//     }

//     res.send("Ok");
// })

// router.get('/database/mapcatidtomusictable',async (req,res,next)=>{
//   let sqlCategory = `SELECT * FROM category`;
//   let sqlInsertToMusic;
//   try{
//     let resultCategory = await db.query(sqlCategory);
//     Array.from(resultCategory).forEach( async (cat)=>{
//       sqlInsertToMusic = `UPDATE music SET cat_id = ${cat.id} WHERE cat_name = '${cat.title}'`;
      
//       try{
//         let result = await db.query(sqlInsertToMusic);
//         console.log(result);
//       }
//       catch(err){
//         console.log(err);
//       }
//     })
//   }
//   catch(err){
//     console.log(err);
//   }

//   res.send("Ok");
// })
module.exports = router;