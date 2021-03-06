// Require Express
const express = require('express');

// Require Router
const router = express.Router();

//Require Controllers
const registrationController = require('../controllers/registrationController');
const sessionController = require('../controllers/sessionController');
const imageController = require('../controllers/imageController');
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');

function secureRoute(req, res, next) {
  if(req.method.toUpperCase() !== 'GET' && req.params.id && req.params.id !== req.session.userId) {
    req.flash('danger', 'Unauthorised!');
    return res.redirect(req.headers.referer);
  }
  //if your middleware is always going to end then don't need next.
  //If the middleware aint going anywhere then you need next
  if(!req.session.userId) {
    // User is not logged in. Disallow!
    return req.session.regenerate(() => {
      req.flash('danger', 'Please log in to view this page');
      res.redirect('/sessions/new');
    });
  }
  return next();
}

// Becomes an Express Router
// Tells Express where to find the pages
router.get('/index', (req, res) => res.render('pages/_index'));

// router.get('/editProfile', (req, res) => res.render('images/editProfile'));
router.get('/', (req, res) => res.render('sessions/new'));
router.get('/registrations', (req, res) => res.render('registrations/new'));

router.route('/registrations/new')
  .get(registrationController.new);

router.route('/registrations')
  .post(registrationController.create);

router.route('/sessions/new')
  .get(sessionController.new); //show the form

router.route('/sessions')
  .get(sessionController.index)
  .post(sessionController.create);

router.route('/sessions/delete')
  .get(sessionController.delete);

// ORDER MATTERS
router.route('/users/index')
  .get(secureRoute, userController.index);

// Show User Profile
// Each User has their own User ID
router.route('/users/:id')
  .get(secureRoute, userController.show)
  .put(secureRoute, userController.update)
  .delete(secureRoute, userController.delete);

router.route('/users/:id/edit')
  .get(secureRoute, userController.edit);

router.route('/images/new')
  .get(secureRoute, imageController.new);

router.route('/images')
  // .get(imageController.index)
  .post(imageController.create);

router.route('/images/:id')
  .get(imageController.show)
  .put(imageController.update)
  .delete((req, res, next) => {
    if(req.session.userId) {
      imageController.delete(req, res, next);
    } else {
      res.redirect('/sessions/new', { message: 'Please log in to delete this image'});
    }
  });

router.route('/images/:id/edit')
  .get(secureRoute, imageController.edit);

router.route('/images/:imageId/')
  .post(commentController.create);

router.route('/images/:imageId/comments/:commentId')
  .delete(secureRoute, commentController.delete);

//Export Router
module.exports = router;
