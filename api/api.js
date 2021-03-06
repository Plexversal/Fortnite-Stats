const fetch = require('node-fetch')
const fs = require('fs')

module.exports = class api {
  constructor(){
    
  }

  static get fnClient(){
    const { fnClient } = require('../index')
    return fnClient
  }

  async level(id){

    const body = {
      "appId": "fortnite",
      "startDate": 0,
      "endDate": 0,
      "owners": [id.toString()],
      "stats": ["s11_social_bp_level", "s13_social_bp_level", "s14_social_bp_level", "s15_social_bp_level"]
  }
    return fetch(`https://statsproxy-public-service-live.ol.epicgames.com/statsproxy/api/statsv2/query`, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `bearer ${api.fnClient.authenticator.accessToken}`
      },
      method: "POST",
      body: JSON.stringify(body)
    }).then(r => r.json())
    .then(r => r)
  }

  async statsRaw(id){

    return fetch(`https://statsproxy-public-service-live.ol.epicgames.com/statsproxy/api/statsv2/account/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `bearer ${api.fnClient.authenticator.accessToken}`
      },
      method: "GET"
    }).then(r => r.json())
    .then(r => r)
  }

  

}


