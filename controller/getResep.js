const { resep } = require("../models/userModel");
const { Op } = require('sequelize');

const searchResep = async (req, res) => {
  const { query } = req.body;

  const requiredFields = ['query'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      msg: `Field berikut harus diisi: ${missingFields.join(', ')}`,
    });
  }

  try {
    let reseps;

    // Membagi query menjadi kata-kata terpisah
    const keywords = query.split(/--/);

    // Membuat kondisi pencarian menggunakan operator Op.and
    const searchConditions = {
      [Op.and]: keywords.map(keyword => ({
        ingredients: {
          [Op.like]: `%${keyword}%`,
        },
      })),
    };

    // Melakukan pencarian berdasarkan kondisi
    reseps = await resep.findAll({
      where: searchConditions,
    });

    // Extract unique ingredients_detected from keywords
    const ingredientDetectedArray = [...new Set(keywords)];

    // Format each recipe in the array
    const recipe = reseps.map(resep => ({
      id: resep.id,
      Title: resep.title,
      // Ingredients_detected: query,
      Ingredients: resep.ingredients.split("--").filter(item => item.trim() !== ''),
      Steps: resep.steps.split("--").filter(item => item.trim() !== ''),
      URL: resep.url,
      // CreatedAt: resep.createdAt,
      // UpdatedAt: resep.updatedAt,
    }));

    if (recipe.length === 0) {
      // If no recipes are found with all specified ingredients, perform a search
      // for recipes that have at least one of the specified ingredients

      const orSearchConditions = {
        [Op.or]: keywords.map(keyword => ({
          ingredients: {
            [Op.like]: `%${keyword}%`,
          },
        })),
      };

      reseps = await resep.findAll({
        where: orSearchConditions,
      });

      // Format each recipe in the array
      const orRecipe = [];
      const maxRecipes = 50;
      let recipesCount = 0;

      for (const resep of reseps) {
        orRecipe.push({
          id: resep.id,
          Title: resep.title,
          // Ingredients_detected: query,
          Ingredients: resep.ingredients.split("--").filter(item => item.trim() !== ''),
          Steps: resep.steps.split("--").filter(item => item.trim() !== ''),
          URL: resep.url,
          // createdAt: resep.createdAt,
          // updatedAt: resep.updatedAt,
        });

        recipesCount += 1;

        // Break the loop if the maximum number of recipes is reached
        if (recipesCount >= maxRecipes) {
          break;
        }
      }

      res.status(200).json({
        success: true,
        msg: 'Berhasil mendapatkan resep',
        data: {
          ingredient_detected: ingredientDetectedArray,
          recipe: orRecipe,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        msg: 'Berhasil mendapatkan resep',
        data: {
          ingredient_detected: ingredientDetectedArray,
          recipe,
        },
      });
    }
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};

module.exports = searchResep;
