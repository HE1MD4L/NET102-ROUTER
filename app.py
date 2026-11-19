from flask import Flask, jsonify, render_template, request
from netmiko import ConnectHandler
import traceback

app = Flask(__name__)

router_device = {
    'device_type': 'cisco_ios_telnet',
    'ip': '192.168.10.110',   # Make sure this is your EVE-NG IP
    'port': 32770,            # Make sure this is your EVE-NG Port
    'username': '',           
    'password': '',           
    'secret': '',             
    'fast_cli': False,
    'global_delay_factor': 2,
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/run-command')
def run_single_command():
    command = request.args.get('cmd')
    if not command:
        return jsonify({"success": False, "error": "No command provided"}), 400

    try:
        net_connect = ConnectHandler(**router_device)
        
        # Try to enable if a secret is provided
        if router_device.get('secret'):
            net_connect.enable()
            
        output = net_connect.send_command(command)
        net_connect.disconnect()
        return jsonify({"success": True, "output": output})
        
    except Exception as e:
        print("\n--- NETMIKO ERROR ---")
        traceback.print_exc() # This will print the exact error to your terminal!
        print("---------------------\n")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/run-all')
def run_all_commands():
    commands_to_run = [
        "show version",
        "show ip interface brief",
        "show running-config",
        "show ip route"
    ]
    results = {}
    
    try:
        net_connect = ConnectHandler(**router_device)
        
        if router_device.get('secret'):
            net_connect.enable()

        for cmd in commands_to_run:
            output = net_connect.send_command(cmd)
            results[cmd] = output

        net_connect.disconnect()
        return jsonify({"success": True, "data": results})
        
    except Exception as e:
        print("\n--- NETMIKO ERROR ---")
        traceback.print_exc() # This will print the exact error to your terminal!
        print("---------------------\n")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)