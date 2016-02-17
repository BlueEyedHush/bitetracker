'use strict';

var app = require('../..');
import request from 'supertest';

var newFood;

describe('Food API:', function() {

  describe('GET /api/foods', function() {
    var foods;

    beforeEach(function(done) {
      request(app)
        .get('/api/foods')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          foods = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      foods.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/foods', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/foods')
        .send({
          name: 'New Food',
          info: 'This is the brand new food!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newFood = res.body;
          done();
        });
    });

    it('should respond with the newly created food', function() {
      newFood.name.should.equal('New Food');
      newFood.info.should.equal('This is the brand new food!!!');
    });

  });

  describe('GET /api/foods/:id', function() {
    var food;

    beforeEach(function(done) {
      request(app)
        .get('/api/foods/' + newFood._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          food = res.body;
          done();
        });
    });

    afterEach(function() {
      food = {};
    });

    it('should respond with the requested food', function() {
      food.name.should.equal('New Food');
      food.info.should.equal('This is the brand new food!!!');
    });

  });

  describe('PUT /api/foods/:id', function() {
    var updatedFood;

    beforeEach(function(done) {
      request(app)
        .put('/api/foods/' + newFood._id)
        .send({
          name: 'Updated Food',
          info: 'This is the updated food!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedFood = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedFood = {};
    });

    it('should respond with the updated food', function() {
      updatedFood.name.should.equal('Updated Food');
      updatedFood.info.should.equal('This is the updated food!!!');
    });

  });

  describe('DELETE /api/foods/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/foods/' + newFood._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when food does not exist', function(done) {
      request(app)
        .delete('/api/foods/' + newFood._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
