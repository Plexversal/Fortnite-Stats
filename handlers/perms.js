module.exports = class Permissions {

    /**
   * @param {Object} permissionData The perission data object to pass in from the database
   * @param {Object} guild Guild Data
   * @param {Object} member Member Data
   */

  constructor(permissionData, guild, member){
    this.permissionData = permissionData;
    this.guild = guild;
    this.member = member;
    this.adminBool = false
    this.modBool = false
    this.userBool = false 

    }
    
    adminCheck(){
        this.permissionData.Admin.forEach(async adminRole => {
            let fetchrole = await this.guild.roles.fetch(adminRole, false)
            if(this.member.roles.cache.has(fetchrole.id)) {
                this.adminBool = true
            }

        })
    }

    modCheck() {
        this.permissionData.Mod.forEach(async modRole => {
            let fetchrole = await this.guild.roles.fetch(modRole, false)
            if(this.member.roles.cache.has(fetchrole.id)) {
                this.modBool = true
            }
        })
    }

    userCheck() {
        this.permissionData.User.forEach(async userRole => {
            let fetchrole = await this.guild.roles.fetch(userRole, false)
            if(this.member.roles.cache.has(fetchrole.id)) {
                this.userBool = true
            }
        })
    }

    async checkRole() {
        this.adminCheck()
        this.modCheck()
        this.userCheck()
        return;

    }

}