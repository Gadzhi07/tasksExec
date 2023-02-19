import pyautogui
from time import sleep

f = open("TaskExec.log", "r")

reply_but, send_mail_but = None, None
del_but, ready_del_but = None, None

count = None

try:
	lines = f.readlines()
	sleep(5)
	
	for line in lines:
		if not reply_but:
			reply_but = pyautogui.locateOnScreen("reply_but.png")
			reply_but = pyautogui.center(reply_but)
		if not del_but:
			del_but = pyautogui.locateOnScreen("del_but.png")
			del_but = pyautogui.center(del_but)
		mail_hacked = line.strip().split(" ")
		print(mail_hacked)
		mail_num = int(mail_hacked[0])
		if not count:
			count = mail_num
		password = mail_hacked[4]
		if mail_num < count:
			exit("TaskExec.log is invalid")
		if count == mail_num:
			pyautogui.click(reply_but)
			sleep(0.2)
			pyautogui.write(password)
			sleep(0.6)
			if not send_mail_but:
				send_mail_but = pyautogui.locateOnScreen("send_mail_but.png")
				send_mail_but = pyautogui.center(send_mail_but)
			pyautogui.click(send_mail_but)
			count += 1
		pyautogui.click(del_but)
		sleep(0.5)
		if not ready_del_but:
			ready_del_but = pyautogui.locateOnScreen("ready_del_but.png")
			ready_del_but = pyautogui.center(ready_del_but)
		pyautogui.click(ready_del_but)
		sleep(0.5)
finally:
	f.close()
