window.PetManager = {
  pet: null,

  getInfo: function () {
    var self = this;
    return window.Http.get('/api/pet/info').then(function (res) {
      if (res.code !== 0) throw new Error(res.message || 'get pet failed');
      self.pet = res.data.pet;
      return self.pet;
    });
  },

  feed: function () {
    return this.doAction('/api/pet/feed');
  },

  bath: function () {
    return this.doAction('/api/pet/bath');
  },

  play: function () {
    return this.doAction('/api/pet/play');
  },

  doAction: function (url) {
    var self = this;
    return window.Http.post(url, {}).then(function (res) {
      if (res.code !== 0) throw new Error(res.message || 'pet action failed');
      self.pet = res.data.pet;
      if (window.UserManager && res.data.user) {
        window.UserManager.updateUser(res.data.user);
      }
      return self.pet;
    });
  }
};
