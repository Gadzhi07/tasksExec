// -== AUTOMATIC COMPLETION OF TASKS ==-
// by FortenZz and Gadzhi

// countReadingMails - number of emails to be read
// delLogs - if 1 (true) deleting logs will be enabled else if 0 (false) disabled

if len(params) == 1 and (params[0] == "-h" or params[0] == "--help") then exit("Usage: \n" + program_path.split("/")[-1] + " [countReadingMails: int (default = 5)] [delLogs: bool (0/1) (default = 1)]\nExample: taskexec 7 0")
countReadingMails = 5
if len(params) >= 1 then countReadingMails = params[0].to_int()
delLogs = true
if len(params) >= 2 then delLogs = params[1].to_int()

local = {}
local.computer = get_shell.host_computer

// [{"mail_number": mail_number, "ip": ip, "lan": lan, "user": user, "pass": pass}]
program_results = []

if not local.computer.is_network_active then
    exit("Network is not active.")
end if

changePerms = function(fileObject)
    libFile = getFile(fileObject, "/lib")
    if libFile then
        libFile.chmod("o+wrx",1)
        libFile.chmod("u+wrx",1)
        libFile.chmod("g+wrx",1)
        libFile.set_owner("guest", 1)
    end if
    
    binFile = getFile(fileObject, "/bin")
    if binFile then
        binFile.chmod("g+wrx", 1)
        binFile.chmod("o+wrx", 1)
        binFile.chmod("u+wrx", 1)
        binFile.set_owner("guest", 1)
    end if

    etcFile = getFile(fileObject, "/etc")
    if etcFile then
        etcFile.chmod("o+wrx",1)
        etcFile.chmod("u+wrx",1)
        etcFile.chmod("g+wrx",1)
        etcFile.set_owner("guest", 1)
    end if

    homeFile = getFile(fileObject, "/home")
    if homeFile then
        homeFile.chmod("o+wrx",1)
        homeFile.chmod("u+wrx",1)
        homeFile.chmod("g+wrx",1)
        homeFile.set_owner("guest", 1)
    end if
end function

allFiles = function(fileObject)
    files = [fileObject] + fileObject.get_folders + fileObject.get_files
    i = 0
    while i < files.len
        if files[i].is_folder then files = files + files[i].get_folders + files[i].get_files
        i = i + 1
        if i > 300 then break
    end while
    return files
end function

find = function(fileName, fileObject)
    founded = []
    files = allFiles(fileObject)
    for file in files
        if lower(file.name).indexOf(lower(fileName)) != null then founded = founded + [file.path]
    end for
    return founded
end function

checkAccess = function(anyObject)
    if typeof(anyObject) == "shell" then fileObject = anyObject.host_computer.File("/") 
    if typeof(anyObject) == "computer" then fileObject = anyObject.File("/")
    if typeof(anyObject) == "file" then fileObject = toFile(anyObject)
    if not typeof(anyObject) == "file" then return null

    homeFolder = null
    for folder in fileObject.get_folders
        if folder.name == "root" then
            if folder.has_permission("w") and folder.has_permission("r") and folder.has_permission("x") then return "root"
        end if
        if folder.name == "home" then
            homeFolder = folder
        end if
    end for
    if not homeFolder then return "guest"
    for folder in homeFolder.get_folders
        if folder.name == "guest" then continue
        if folder.has_permission("w") and folder.has_permission("r") and folder.has_permission("x") then return folder.name
    end for
    return "guest"
end function

toFile = function(anyObject)
    if typeof(anyObject) == "shell" then return anyObject.host_computer.File("/")
    if typeof(anyObject) == "computer" then return anyObject.File("/")
    if typeof(anyObject) == "file" then
        while anyObject.parent
            anyObject = anyObject.parent
        end while
        return anyObject
    end if
    return null
end function

getFile = function(fileObject, path)
    ways = path.split("/")[1:]
    
    i = 0       
    while fileObject.path != path
        folders = fileObject.get_folders
        files = fileObject.get_files
        
        for f in folders + files
            if f.name == ways[i] then
                fileObject = f
            end if
        end for
        i = i + 1
    end while

    if fileObject.path == path then return fileObject
end function

corruptLog = function(computer)
    createBakFile = computer.touch("/var","system.bak")
    if createBakFile != 1 then
        print("Error: " + createBakFile)
    end if
    logFile = computer.File("/var/system.log")
    if logFile then
        deleteLogFile = logFile.delete
    end if
    bakFile = computer.File("/var/system.bak")
    if bakFile then
        if bakFile.move("/var", "system.log") != 1 then return print("Error: Could not rename bak.")
    end if
    return print("All step done. Log cleared.")
end function

getPasswordAndClearLogs = function(user, obj)
    if not obj then return null
    hash_password = null

    passwd = getFile(toFile(obj), "/etc/passwd")

    if not passwd or not passwd.has_permission("r") then
        print("<color=red>No access to <b>/etc/passwd\n")
        return false
    else
        cont = passwd.get_content.split("\n")[:-1]
        if not user then
            hash_password = cont[0].split(":")[1]
        else
            for c in cont
                if c.split(":")[0] == user then
                    hash_password = c.split(":")[1]
                    break
                end if
            end for
        end if
        if not hash_password then return false
        password = cr.decipher(hash_password)
        if globals.delLogs then
            if typeof(obj) == "computer" then corruptLog(obj)
            if typeof(obj) == "shell" then corruptLog(obj.host_computer)
        end if
        return password
    end if
end function

Hack = function(IP, PORT, injectArg = "madeinRussia")
    net_session = mx.net_use(IP, PORT)
    if net_session then print("Connected!")
    if not net_session then return false
    
    metaLib = net_session.dump_lib
    
    results = []
    memory = mx.scan(metaLib)
    for mem in memory
        address = mx.scan_address(metaLib, mem).split("Unsafe check: ")
        for add in address[1:]
            value = add[add.indexOf("<b>")+3:add.indexOf("</b>")]
            value = value.replace("\n", "")
            
            result = metaLib.overflow(mem, value, injectArg)
            
            if not result then continue
            if typeof(result) == "file" or typeof(result) == "computer" or typeof(result) == "file" then results.push(result)
        end for
    end for
    return results
end function

sortHacked = function(objs)
    out = {"shell": [], "computer": [], "file": [], "root": [], "user": [], "guest": []}
    for obj in objs
        if not out.hasIndex(typeof(obj)) then continue
        out[typeof(obj)].push(obj)
    end for
    for obj in out.shell + out.computer + out.file
        if not obj then continue
        user = checkAccess(obj)
        if user == "root" or user == "guest" then
            out[user].push(obj)
        else
            out.user.push(obj)
        end if
    end for
    return out.root + out.user + out.guest
end function

hackObjs = function(objs, attack)
    ip = attack.ip
    lan = attack.lan
    user = attack.user
    mail_number = attack.mail_number

    sorted_objs = sortHacked(objs)
    for obj in sorted_objs
        if not obj then continue
        changePerms(toFile(obj))
        output = getPasswordAndClearLogs(user, obj)
        if typeof(output) == "string" then
            // print and save the information about the attack in a file
            print("<color=red>" + mail_number + " <color=green>Password: " + output)
            add = {"mail_number": mail_number, "ip": ip, "lan": lan, "user": user, "pass": output}
            if globals.program_results.indexOf(add) != null then return true
            globals.program_results.push(add)

            savefile = globals.local.computer.File(current_path + "/TaskExec.log")
            if not savefile then
                globals.local.computer.touch(current_path, "TaskExec.log")
                savefile = globals.local.computer.File(current_path + "/TaskExec.log")
            end if
            if not savefile then return true
            if not savefile.has_permission("r") or not savefile.has_permission("w") then return true
            fcontent = savefile.get_content
            fcontent = fcontent + str(mail_number) + " " + ip + " " + lan + " " + user + " " + output + char(10)
            savefile.set_content(fcontent)
            return true
        end if
    end for
    return false
end function

hackMail = function(attack)
    ip = attack.ip
    lan = attack.lan
    mail_number = attack.mail_number
    
    router = get_router(ip)
    ports = {}
    ports[router.local_ip] = [0]
    for port in router.used_ports
        if not ports.hasIndex(port.get_lan_ip) then ports[port.get_lan_ip] = []
        ports[port.get_lan_ip].push(port.port_number)
    end for
    if not ports.hasIndex(lan) then 
        print("<color=red>" + mail_number + "</color>: 0 ports")
        return null
    end if

    print("<color=red>" + mail_number + "</color>: " + ports[lan].len + " ports")
    for port in ports[lan]      
        objs = Hack(ip, port)
        if not objs then continue
        if hackObjs(objs, attack) then return true
    end for

    objs = Hack(router.public_ip, 0, lan)
    if not objs then return false
    print("Bounce attack:\n")
    if hackObjs(objs, attack) then return true
end function

main = function()
    targets = []
    print("<size=125%><b>FOUND:")
    mail_number = 0
    for mail in metamail.fetch
        if mail_number >= globals.countReadingMails then break
        splitMail = mail.split(char(10))
        id = splitMail[2].split(": ")[1]
        subj = splitMail[4].split(": ")[1]
        mail = metamail.read(id).replace(char(10)+char(10), "")
        if subj != "Mission Contract" then continue

        // get ip
        undo_ip_text = "The remote ip of the victim is <b>"
        fir_i = mail.indexOf(undo_ip_text) + undo_ip_text.len()
        sec_i = mail[fir_i:].indexOf("</b>") + fir_i
        ip = mail[fir_i:sec_i]

        //get lan
        lan = null
        undo_lan_text = "ip LAN is <b>"
        fir_i = mail.indexOf(undo_lan_text) + undo_lan_text.len()
        sec_i = mail[fir_i:].indexOf("</b>") + fir_i
        lan = mail[fir_i:sec_i]

        // user (false - any user)
        user = false
        if mail.indexOf("any user") == null then
            undo_user_text = "of the user <b>"
            fir_i = mail.indexOf(undo_user_text) + undo_user_text.len()
            sec_i = mail[fir_i:].indexOf("</b>") + fir_i
            user = mail[fir_i:sec_i]
        end if

        printUser = user
        if not printUser then printUser = "ANY"
        // show mails
        print("-<color=red>" + mail_number + "</color>----------------------")
        print("<b>*</b> IP: <b>" + ip)
        print("<b>*</b> LAN: <b>" + lan)
        print("<b>*</b> User: <b>" + printUser)
        targets.push({"mail_number": mail_number, "ip": ip, "lan": lan, "user": user})
        mail_number = mail_number + 1
    end for
    print("------------------------")

    attacks = []
    choice = user_input("\nIndex(es) sep "" "" / ""all"": ")
    if choice == "all" or choice == "" then
        attacks = targets
    else
        choice = choice.split(" ")
    
        for i in choice
            attacks.push(targets[i.to_int])
        end for
    end if

    for attack in attacks
        hackMail(attack)
    end for

    print("\n\n\n")
    for i in globals.program_results
        printUser = user
        if not printUser then printUser = "ANY"
        print("-<color=red>"+i.mail_number+"</color>----------------------")
        print("<b>*</b> IP: <b> "+i.ip)
        print("<b>*</b> LAN: <b> "+i.lan)
        print("<b>*</b> User: <b>" + printUser)
        print("<b>*</b> Password:<b><color=red> "+i.pass)
    end for
    print("------------------------")
end function

// load metaxploit
mx = null
mx_finded_files = find("metaxploit.so", toFile(local.computer))
for mx_file in mx_finded_files
    mx = include_lib(mx_file)
    if typeof(mx) == "MetaxploitLib" then
        break
    end if
end for
if not mx then exit("Warning missing lib metaxploit.so.")

// load crypto
cr = null
cr_finded_files = find("crypto.so", toFile(local.computer))
for mx_file in cr_finded_files
    cr=include_lib(mx_file)
    if typeof(cr) == "cryptoLib" then
        break
   end if
end for
if not cr then exit("Warning missing lib crypto.so.")


// load metamail
login = null
pass = null
metamail = null
while true
    if typeof(metamail) != "MetaMail" or not login then login = user_input("Mail: ")
    if typeof(metamail) != "MetaMail" or not pass then pass = user_input("Password: ", true)
    metamail = mail_login(login, pass)
    if metamail and typeof(metamail) == "MetaMail" then
        print("<color=green>Accessed!\n")
        break
    end if
    print("<color=red>Error\n")
end while

main
