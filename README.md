# tasksExec 

A tool for the game [GreyHack](https://store.steampowered.com/app/605230/Grey_Hack/). 

Execution "Credentials needed" tasks with rep. 0 

Before executing the program, go to the hack shop and select tasks with the name "Credentials needed" and the required reputation "rep. 0".

Launch: `taskexec [countReadingMails: int (default = 5)] [delLogs: bool (0/1) (default = 1)]`

Example: `taskexec 7 0`

`countReadingMails` - number of emails to be read

`delLogs` - if 1 (true) deleting logs will be enabled else if 0 (false) disabled

## Advantages:
- save results to a file
- use bounce exploits
- beautiful output
- you can choose the tasks that will be completed
- good code

## TODO:
- If the user is Any, then when changing the password, return the changed password.

I made this with code from [rocShell](https://github.com/rocketorbit/rocShell) and FortenZz#2561 helped me.
