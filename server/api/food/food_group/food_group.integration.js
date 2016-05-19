'use strict';

var app = require('../..');
import request from 'supertest';

var newFoodGroup;

describe('FoodGroup API:', function() {

  describe('GET /api/food_groups', function() {
    var foodGroups;

    beforeEach(function(done) {
      request(app)
        .get('/api/food_groups')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          foodGroups = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      foodGroups.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/food_groups', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/food_groups')
        .send({
          name: 'New FoodGroup',
          info: 'This is the brand new foodGroup!!!',
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newFoodGroup = res.body;
          done();
        });
    });

    it('should respond with the newly created foodGroup', function() {
      newFoodGroup.name.should.equal('New FoodGroup');
      newFoodGroup.info.should.equal('This is the brand new foodGroup!!!');
    });

  });

  describe('GET /api/food_groups/:id', function() {
    var foodGroup;

    beforeEach(function(done) {
      request(app)
        .get('/api/food_groups/' + newFoodGroup._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          foodGroup = res.body;
          done();
        });
    });

    afterEach(function() {
      foodGroup = {};
    });

    it('should respond with the requested foodGroup', function() {
      foodGroup.name.should.equal('New FoodGroup');
      foodGroup.info.should.equal('This is the brand new foodGroup!!!');
    });

  });

  describe('PUT /api/food_groups/:id', function() {
    var updatedFoodGroup;

    beforeEach(function(done) {
      request(app)
        .put('/api/food_groups/' + newFoodGroup._id)
        .send({
          name: 'Updated FoodGroup',
          info: 'This is the updated foodGroup!!!',
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedFoodGroup = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedFoodGroup = {};
    });

    it('should respond with the updated foodGroup', function() {
      updatedFoodGroup.name.should.equal('Updated FoodGroup');
      updatedFoodGroup.info.should.equal('This is the updated foodGroup!!!');
    });

  });

  describe('DELETE /api/food_groups/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/food_groups/' + newFoodGroup._id)
        .expect(204)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when foodGroup does not exist', function(done) {
      request(app)
        .delete('/api/food_groups/' + newFoodGroup._id)
        .expect(404)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

  });

});
