const recipe = require('../controller/recipe')
routes.post('/create', auth.ensureAuthenticated, auth.ensureOwner, recipe.create);


