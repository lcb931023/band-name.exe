/** Class managing muting channels temporarily */
// TODO make muted channel tracking persistant across bot ran sessions
// by adding a storage
class MuteController {
  /**
   * Create a mute controller 
   * @param {boolean} [autoUnmute = true] - The flag for unmuting channels after a duration
   * @param {number} [muteDuration = 604800000] - The duration of how long to wait till unmuting the channel, in milliseconds. Default to 7 days
   */
  constructor(autoUnmute = true, muteDuration = 604800000) {
    this.autoUnmute = autoUnmute;
    if (muteDuration > 2147483647) {
      throw new Error('setTImeout uses 32bit int to store the delay. max topped at 2147483647 (24.85 days)');
    } 
    this.muteDuration = muteDuration;
    this.muted = [];
  }
  
  unmute(channel) {
    console.log(this, channel);
    if(this.hasMuted(channel)) this.muted.splice(this.muted.indexOf(channel), 1);
  }
  
  mute(channel) {
    if(!this.hasMuted(channel)) this.muted.push(channel);
    if (this.autoUnmute) {
      setTimeout(this.unmute.bind(this, channel), this.muteDuration);
    }
  }
  
  /**
   * @return {boolean}
   */
  hasMuted(channel) {
    return this.muted.includes(channel);
  }
}

module.exports = MuteController;
