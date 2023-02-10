const { MongoClient } = require("mongodb");

const url = "mongodb://mongosrv";
const client = new MongoClient(url);

const bcrypt = require("bcryptjs");

let user1Id,
  user2Id,
  user3Id,
  user4Id,
  user5Id,
  message1Id,
  message2Id,
  message3Id,
  message5Id;
async function insertTestData() {
  try {
    await client.connect();
    console.log("Connected to the MongoDB server");

    const db = client.db("socialnetwork");
    const usersCollection = db.collection("users");
    const messagesCollection = db.collection("messages");
    const followersCollection = db.collection("followers");
    const likesCollection = db.collection("likes");

    // Controllo se ci sono già documenti nella collezione "users"
    const usersCount = await usersCollection.countDocuments({});
    if (usersCount === 0) {
      // Inserimento di alcuni utenti di prova nella collection "users"
      // Codifica della password
      const password1 = "password1";
      const hashedPassword1 = await bcrypt.hash(password1, 10);

      const password2 = "password2";
      const hashedPassword2 = await bcrypt.hash(password2, 10);

      const password3 = "password3";
      const hashedPassword3 = await bcrypt.hash(password3, 10);

      const password4 = "password4";
      const hashedPassword4 = await bcrypt.hash(password4, 10);

      const password5 = "password5";
      const hashedPassword5 = await bcrypt.hash(password5, 10);

      const users = [
        {
          username: "m_rossi",
          password: hashedPassword1,
          name: "Mario",
          surname: "Rossi",
          bio: "Sono un ragazzo divertente",
        },
        {
          username: "sarahjohnson",
          password: hashedPassword2,
          name: "Sarah",
          surname: "Johnson",
          bio: "Psicologa clinica con un interesse per la terapia online e la salute mentale",
        },
        {
          username: "nicolablack",
          password: hashedPassword3,
          name: "Nicola",
          surname: "Black",
          bio: "Stilista di moda con una passione per la sartoria e la creazione di abiti su misura",
        },
        {
          username: "luchetto",
          password: hashedPassword4,
          name: "Luca",
          surname: "Bianchi",
          bio: "La cucina è la mia passione, e non c'è niente di meglio che creare nuovi piatti e condividerli con i miei clienti",
        },
        {
          username: "sandro",
          password: hashedPassword5,
          name: "Alessandro",
          surname: "Pompei",
          bio: "Ingegnere informatico con esperienza nel campo dell'intelligenza artificiale",
        },
      ];
      const insertUsersResult = await usersCollection.insertMany(users);
      console.log(
        "Users inserted successfully:",
        insertUsersResult.insertedIds
      );

      // Recupero gli ID degli utenti appena inseriti
      user1Id = insertUsersResult.insertedIds[0];
      user2Id = insertUsersResult.insertedIds[1];
      user3Id = insertUsersResult.insertedIds[2];
      user4Id = insertUsersResult.insertedIds[3];
      user5Id = insertUsersResult.insertedIds[4];
    } else {
      console.log("Users already exist in the database, skipping insert");
    }
    // Controllo se ci sono già documenti nella collezione "messages"
    const messagesCount = await messagesCollection.countDocuments({});
    if (messagesCount === 0) {
      // Inserimento di alcuni messaggi di prova nella collection "messages"
      const messages = [
        {
          userId: user1Id,
          text: "Cosa c'è di meglio che ridere con gli amici? Appena finito una serata divertentissima",
          date: new Date(2023, 0, 21, 16, 0, 0),
        },
        {
          userId: user2Id,
          text: "La salute mentale è tanto importante quanto la salute fisica. Appena finito una sessione di terapia online con un paziente, è sempre gratificante vedere il progresso",
          date: new Date(2023, 0, 19, 15, 0, 0),
        },
        {
          userId: user3Id,
          text: "Appena finito di creare un abito su misura per una cliente, la soddisfazione di vederlo indossato e sentirsi perfetto è incomparabile",
          date: new Date(2023, 0, 15, 11, 0, 0),
        },
        {
          userId: user3Id,
          text: "La moda è un'arte che non smette mai di evolversi e ci stupisce sempre con nuove tendenze e idee innovative. Questa stagione, vediamo il ritorno delle linee pulite e semplici, che rappresentano un'estetica raffinata e sofisticata. Tuttavia, non mancano tocchi di audacia nei colori e nei tessuti, che rendono le creazioni ancora più interessanti e attuali. La moda è un mezzo per esprimere la propria personalità e la propria unicità, e oggi voglio incoraggiare tutti a sperimentare e ad avere il coraggio di uscire dalla propria comfort zone. Siamo tutti diversi e la bellezza sta proprio nella diversità. Non importa se segui le tendenze o ti vesti come ti fa sentire a tuo agio, l'importante è che tu sia fedele a te stesso e alla tua personalità. In un mondo dove tutto scorre velocemente e cambia continuamente, la moda è un'arte che ci permette di fermare il tempo e di creare un'immagine che ci rappresenti. Siamo tutti artisti a modo nostro, e la moda è il nostro palcoscenico. Esprimiamoci e mostriamo il mondo chi siamo davvero!",
          date: new Date(2023, 0, 10, 15, 0, 0),
        },
        {
          userId: user4Id,
          text: "Ho creato un piatto fenomenale!",
          date: new Date(2023, 0, 6, 10, 0, 0),
        },
        {
          userId: user5Id,
          text: "Appena finito di leggere un libro interessante sull'intelligenza artificiale, non vedo l'ora di applicare alcune delle nuove tecniche che ho imparato al mio lavoro",
          date: new Date(2023, 1, 5, 12, 15, 0),
        },
        {
          userId: user5Id,
          text: "Auguro a tutti un buon anno nuovo!",
          date: new Date(2022, 0, 1, 0, 30, 0),
        },
        {
          userId: user1Id,
          text: "Stasera esibizione di stand-up comedy con gli amici, il pubblico era in delirio!",
          date: new Date(2022, 3, 15, 12, 45, 30),
        },
        {
          userId: user2Id,
          text: "La terapia è un processo che richiede tempo e pazienza, ma vedere i risultati ottenuti dai pazienti rende ogni sforzo ripagato.",
          date: new Date(2022, 7, 20, 17, 30, 15),
        },
        {
          userId: user3Id,
          text: "Ci vuole passione, precisione e un'attenzione maniacale ai dettagli per creare un abito su misura che sia perfetto.",
          date: new Date(2022, 10, 25, 9, 0, 0),
        },
        {
          userId: user4Id,
          text: "La cucina è un'arte che richiede creatività e maestria, mi piace mischiare sapori e culture per creare piatti unici e sorprendenti.",
          date: new Date(2022, 2, 10, 5, 15, 0),
        },
        {
          userId: user5Id,
          text: "La tecnologia sta avanzando a un ritmo incredibile e l'intelligenza artificiale è solo la punta dell'iceberg. Sono entusiasta di vedere dove ci porterà in futuro.",
          date: new Date(2022, 1, 10, 2, 15, 0),
        },
        {
          userId: user1Id,
          text: "La musica è la colonna sonora della nostra vita e oggi ho scoperto un nuovo artista che mi ha fatto ballare tutto il giorno!",
          date: new Date(2022, 6, 5, 14, 0, 30),
        },
        {
          userId: user2Id,
          text: "La mente è uno strumento potente e curare la propria salute mentale è fondamentale per vivere al meglio. Oggi ho aiutato un paziente a superare un blocco emotivo e il suo sorriso è stato la mia ricompensa più grande.",
          date: new Date(2022, 2, 20, 11, 0, 0),
        },
        {
          userId: user4Id,
          text: "La cucina è un'arte che mi permette di esprimere la mia creatività e la mia passione per i sapori. Oggi ho preparato un piatto che ha lasciato tutti a bocca aperta!",
          date: new Date(2022, 8, 15, 18, 45, 0),
        },
      ];
      const insertMessagesResult = await messagesCollection.insertMany(
        messages
      );
      console.log(
        "Messages inserted successfully:",
        insertMessagesResult.insertedIds
      );

      // Recupero gli ID dei messaggi
      message1Id = insertMessagesResult.insertedIds[0];
      message2Id = insertMessagesResult.insertedIds[1];
      message3Id = insertMessagesResult.insertedIds[2];
      message4Id = insertMessagesResult.insertedIds[3];
      message5Id = insertMessagesResult.insertedIds[4];
      message6Id = insertMessagesResult.insertedIds[5];
    } else {
      console.log("Messages already exist in the database, skipping insert");
    }

    // Controllo se ci sono già documenti nella collezione "followers"
    const followersCount = await followersCollection.countDocuments({});
    if (followersCount === 0) {
      // Inserimento di alcuni followers di prova nella collection "followers"
      const followers = [
        {
          followedUser: user1Id,
          followerId: user2Id,
        },
        {
          followedUser: user1Id,
          followerId: user3Id,
        },
        {
          followedUser: user2Id,
          followerId: user3Id,
        },
        {
          followedUser: user5Id,
          followerId: user4Id,
        },
        {
          followedUser: user4Id,
          followerId: user5Id,
        },
        {
          followedUser: user1Id,
          followerId: user5Id,
        },
      ];
      const insertFollowersResult = await followersCollection.insertMany(
        followers
      );
      console.log(
        "Followers inserted successfully:",
        insertFollowersResult.insertedIds
      );
    } else {
      console.log("Followers already exist in the database, skipping insert");
    }

    // Controllo se ci sono già documenti nella collezione "likes"
    const likesCount = await likesCollection.countDocuments({});
    if (likesCount === 0) {
      // Inserimento di alcuni likes di prova nella collection "likes"
      const likes = [
        {
          messageId: message1Id,
          userId: user2Id,
        },
        {
          messageId: message2Id,
          userId: user1Id,
        },
        {
          messageId: message2Id,
          userId: user3Id,
        },
        {
          messageId: message2Id,
          userId: user5Id,
        },
        {
          messageId: message3Id,
          userId: user5Id,
        },
        {
          messageId: message4Id,
          userId: user1Id,
        },
        {
          messageId: message4Id,
          userId: user5Id,
        },
        {
          messageId: message5Id,
          userId: user1Id,
        },
        {
          messageId: message5Id,
          userId: user2Id,
        },
        {
          messageId: message6Id,
          userId: user2Id,
        },
      ];
      const insertLikesResult = await likesCollection.insertMany(likes);
      console.log(
        "Likes inserted successfully:",
        insertLikesResult.insertedIds
      );
    } else {
      console.log("Likes already exist in the database, skipping insert");
    }
    // Chiudo la connessione al server MongoDB
    await client.close();
    console.log("Disconnected from the MongoDB server");
  } catch (error) {
    console.log(error);
  }
}

insertTestData();
