
(function(DecafMUD) {

    // Shortcut the TELNET constants for ease of use.
    var t = DecafMUD.TN;
    
    /** Handles the TELNET option MNES.
     * @name MNES
     * @class DecafMUD TELOPT Handler: GMCP
     * @exports GMCP as DecafMUD.plugins.Telopt.MNES
     * @param {DecafMUD} decaf The instance of DecafMUD using this plugin. */
    var MNES = function(decaf) {
        this.decaf = decaf;
        this.decaf.mnes = this;
    }
    
    
    /** Helper for sending MNES messages. */
    MNES.prototype.sendMNES = function(command, data) {
        let out = '';
        if (data !== undefined) {
            out = JSON.stringify([data]);
            out = ' ' + out.substr(1, out.length - 2); 
        }

        this.decaf.sendIAC(t.IAC + t.SB + t.MNES + command + out + t.IAC + t.SE);
    }

    /** Handle an incoming MNES message. */
    MNES.prototype._sb = function(data) {
        // Find the end of the command.
        var ind = data.search(/[^A-Za-z]/), pckg, out;
        if (ind !== -1) {
            pckg = data.substr(0, ind);
            if (ind + 1 !== data.length) {
                //out = JSON.parse('[' + data.substr(ind + 1) + ']')[0];
                console.groupEnd('DecafMUD[' + this.decaf.id + '] mnes ' + pckg);
            }
        } else { 
            pckg = data; 
        }
        
        // If there's no package, return.
        if (pckg.length === 0) { 
            return; 
        }
        
        // Debug received MNES command.
        if (out !== undefined && 'console' in window && console.groupCollapsed) {
            console.groupCollapsed('DecafMUD[' + this.decaf.id + '] RCVD IAC SB MNES "' + pckg + '" ... IAC SE');
            console.dir(out);
            console.groupEnd('DecafMUD[' + this.decaf.id + '] RCVD IAC SB MNES "' + pckg + '" ... IAC SE');
        }

        // Get the function for the received command.
        var func = this.getFunction(pckg);
        
        // Call the appropriate function.
        if (func) { 
            func.call(this, out); 
        }
    }

    /** Command to find a given function. */
    MNES.prototype.getFunction = function(command) {
        var parts = command.split('.'), top = this.commands;
        while (parts.length > 0) {
            var part = parts.shift();
            if (top[part] === undefined) { 
                return undefined; 
            }
            top = top[part];
        }
        
        if (typeof top === 'function') { 
            return top; 
        }
        return undefined;
    }

    /** The command structure for MNES. */
    MNES.prototype.commands = {};

    /** COMMAND: Core */
    MNES.prototype.commands.Send = {
        'version': 1,

        'Var': function(data) {
            console.debug('Got MNES VAR request:', data);
        }

    };

    // Expose it to DecafMUD
    DecafMUD.plugins.Telopt[t.NEWENV] = MNES;

})(DecafMUD);