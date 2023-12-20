const Sequelize  = require("sequelize");
const db = require("../config/database");
const {DataTypes} = Sequelize;

const Users = db.define('users',{
    name:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING
    },
    refresh_token:{
        type:DataTypes.TEXT
    },
    imageUrl:{
        type:DataTypes.STRING
    },
},{
    freezeTableName:true
});


const articles = db.define('articles',{
    imageUrl:{
        type:DataTypes.STRING
    },
    titleArtikel:{
        type:DataTypes.STRING
    },
    description:{
        type:DataTypes.TEXT
    },
    ingredients:{
        type:DataTypes.TEXT
    },
    steps:{
        type:DataTypes.TEXT
    },
    createdAt:{
    type: DataTypes.DATE,
    // defaultValue: Sequelize.NOW, // Nilai default adalah waktu saat ini
    },
    userId:{
        type:DataTypes.INTEGER
    },
},{
    freezeTableName:true
});
articles.belongsTo(Users, { foreignKey: 'userId' })



const comment = db.define('comment',{
    commentUserId:{
        type:DataTypes.INTEGER
    },
    artikelId:{
        type:DataTypes.INTEGER
    },
    contentComment:{
        type:DataTypes.STRING
    },
    createdAt:{
        type: DataTypes.DATE,
        // defaultValue: Sequelize.NOW, // Nilai default adalah waktu saat ini
        },

},{
    freezeTableName:true
});



const resep = db.define('resep',{
    title:{
        type:DataTypes.STRING
    },
    ingredients:{
        type:DataTypes.TEXT
    },
    steps:{
        type:DataTypes.TEXT
    },
    url:{
        type: DataTypes.STRING,
        // defaultValue: Sequelize.NOW, // Nilai default adalah waktu saat ini
        },

},{
    freezeTableName:true
});

// querybahan
const querybahan = db.define('querybahan',{
    bahan:{
        type:DataTypes.INTEGER
    },
    imageUrl:{
        type:DataTypes.INTEGER
    }

},{
    freezeTableName:true
});


// Assuming a one-to-many relationship between Users and articles
Users.hasMany(comment, { foreignKey: 'commentUserId' });
comment.belongsTo(Users, { foreignKey: 'commentUserId' });

// Assuming a one-to-many relationship between articles and comment
Users.hasMany(comment, { foreignKey: 'commentUserId' });
comment.belongsTo(Users, { foreignKey: 'commentUserId' });

module.exports = {Users, articles, comment, resep, querybahan};


// Define the association
Users.hasMany(articles, { foreignKey: 'userId' });
articles.belongsTo(Users, { foreignKey: 'userId' });