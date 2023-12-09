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
        type:DataTypes.STRING
    },
    createdBy:{
        type:DataTypes.STRING
    },
    createdAt:{
    type: DataTypes.DATE,
    // defaultValue: Sequelize.NOW, // Nilai default adalah waktu saat ini
    },
    contentArtikel:{
        type:DataTypes.TEXT
    },
    userId:{
        type:DataTypes.INTEGER
    },
},{
    freezeTableName:true
});

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


// Assuming a one-to-many relationship between Users and articles
Users.hasMany(comment, { foreignKey: 'commentUserId' });
comment.belongsTo(Users, { foreignKey: 'commentUserId' });

// Assuming a one-to-many relationship between articles and comment
Users.hasMany(comment, { foreignKey: 'commentUserId' });
comment.belongsTo(Users, { foreignKey: 'commentUserId' });

module.exports = {Users, articles, comment};