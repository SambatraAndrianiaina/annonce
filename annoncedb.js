const readline = require('readline');
const { Pool } = require('pg');



const r= readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'annonce',
  password: '123456',
  port: 3000,
});

function ask (text){
  return new Promise((resolution)=> {
      r.question(text, (valeur)=>{
          resolution(valeur);
      });
  });
};

async function time(){
  let today = new Date();
  let month = today.getMonth() + 1;
  let day = today.getDate();
  let heures = today.getHours();
  let minutes = today.getMinutes();  
  let secondes = today.getSeconds();
  let temps = heures + ":" + minutes + ":" + secondes;
  return { temps, month, day };
}

async function add(){
  try{
    let { temps, month, day } = await time();

    let lieu = await ask("Entrer lieu : ");
    let prix = await ask("Entrer prix :");
    
    if (!isNaN(parseInt(prix))) {
      pool.query('INSERT INTO annonces (lieu, prix, time, mois, jours) VALUES ($1, $2, $3, $4, $5)', [lieu, parseInt(prix), temps, month , day ], (err,res) =>{
        if (err){  
          console.error('Erreur lors de l\'insertion de l\'annonce :', err);
        } else {
          console.log('Nouvelle annonce ajoutée')
          principale();
        }
      }); 
    } else {
      console.log('Le prix doit être un nombre entier.');
      add();
    }
  } catch (error){
  console.log("Erreur:" , error)
  } 
}

function listannnonce(res) {
  console.log('Liste des annonces :');
  res.rows.forEach((annonce, index) => {
    console.log(`Annonce n° ${index + 1}`);
    console.log("ID : " , annonce.id )
    console.log(`Lieu : ${annonce.lieu}`);
    console.log(`Prix : ${annonce.prix}`);
    console.log('Enregistré le '+annonce.jours +'/'+"0"+annonce.mois+'/2024'+" à "+ annonce.time )
    if (annonce.timeupdate !== null){
      console.log("Donné mise à jour le "+ annonce.joursupdate+"/0"+annonce.moisupdate+'/2024'+" à "+ annonce.timeupdate)
    }
    console.log('----------------------------');
  }); 
}

function list() {
  pool.query('SELECT * FROM annonces', (err, res) => {
    if (err) {
      console.error('Erreur lors de la récupération des annonces :', err);
    } else {
      listannnonce(res);
      principale();
    }
  });
}

async function update(){
  try{
    let { temps, month, day } = await time();
    let idUpdate = await ask("Donner l'id du donné que vous voulez changer: ");
    let newprix = await ask("Entrer la nouvelle prix: ");
    pool.query('UPDATE annonces SET prix = $1 WHERE id = $2', [newprix,idUpdate], (err,res)=>{
      if (err) {
        console.error('Erreur lors de la mise à jour des données :', err);
      } else {
        console.log('Données mises à jour avec succès');
        principale();
      };
    });

    pool.query('UPDATE annonces SET timeupdate = $1, moisupdate = $2 , joursupdate = $3 WHERE id = $4',[temps, month, day, idUpdate]), (err,res)=>{
      if (err) {
        console.error('Erreur lors de la mise à jour du temps :', err);
      } else {
        console.log('Temps mises à jour avec succès');
      };
    }
  } catch(error) {
    console.log("Une erreur s'est produite :" , error)
  }
}

async function search(){
  try{
    let joursearch= await ask("Donné le jours du donné que vous chercher:");
    pool.query('SELECT * FROM annonces WHERE jours = $1 ',[joursearch],(err,res)=>{
      if(err){
        console.log("Erreur lors de la récuperation des donnés:", err);
      } else {
        listannnonce(res);
        principale();
      }
    })
  } catch(error) {
    console.log("Une erreur s'est produite :" , error)
  }
}

function principale(){
    r.question("Que souhaiter vous faire?",(input) =>{
        if (input.toLowerCase() === 'help'){
            console.log("add - Pour ajouter une annonce");
            console.log("list - Pour Lister tous les annonces");
            principale();
        }else if (input.toLowerCase()=== "add"){
          add();
        }else if (input.toLowerCase()=== "list"){
          list();
        }else if (input.toLowerCase()=== "update"){
          update();
        }else if (input.toLowerCase()=== "search"){
          search();
        }else {
            console.log('Commande incorrecte!');
            principale();
        };
    })
};
principale();