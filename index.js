
let replying = false;
const current_interaction = {};
let INTERACTIONS = [];
async function prompt (text) {
	if (!text) return;
	const api_body = {
	};
	for (const [id, value] of Object.entries(PROMPTCONFIG)) {
		api_body[id] = value;
	}
	api_body.prompt += text;
	let response = await fetch(SETTINGS.url + "/api/v1/generate", {
		method: "POST",
	  body: JSON.stringify(api_body),
	});
	console.log(response);

	//let response = await axios.post(, api_body);
	response = await response.json();
	console.log(response);
	if (!response.results[0].text) return await gen();
	response = response.results[0].text;
	return response;
};
async function gen () {
	if (!current_interaction.id) return;
	let text = "";
	const CURRENT_USER = document.getElementById("user").value;
	const CURRENT_PUTER = document.getElementById("puter").value;
	for (const user of current_interaction.characters) {
		let tempPrompt = "";
		tempPrompt = PROMPTS[user].replaceAll("{{user}}", CURRENT_USER);
		tempPrompt = tempPrompt.replaceAll("{{char}}", CURRENT_PUTER);
		tempPrompt = tempPrompt.replaceAll("{{persona}}", user);
		text += `\n\n<|eot_id|><|start_header_id|>${user}<|end_header_id|>${user}: ${tempPrompt}`;
	}
	let tempScenario = "";
	tempScenario = (SCENARIOS[current_interaction.scenario] || "There is no predefined scenario.").replaceAll("{{user}}", document.getElementById("user").value);
	tempScenario = tempScenario.replaceAll("{{char}}", document.getElementById("puter").value);
	text += `<|eot_id|><|start_header_id|>Scenario<|end_header_id|>Scenario: ${tempScenario}`;
	text += "\n\n---------Interaction Start---------\n\n";
	for (const memory of current_interaction.memories) {
		if (!memory.deleted) 	text += `\n\n<|eot_id|><|start_header_id|>${memory.user}<|end_header_id|>${memory.user}: ${memory.text}`;
	}
	const character = document.getElementById("puter").value;
	console.log(character);	
	if (character === "null") return console.log("cancelling, no puter");
	text += `\n\n<|eot_id|><|start_header_id|>${character}<|end_header_id|>${character}: `;
	console.log(text);
	let response = await prompt(text);
	//return ;
	const message = {};
	message.user = document.getElementById("puter").value;
	message.id = current_interaction.memories.length;
	message.text = response;
	message.deleted = false;
	current_interaction.memories.push(message);
	appendMessage(message, document.getElementById("messages"));
	localStorage.setItem(`memories-${current_interaction.id}`, JSON.stringify(current_interaction.memories));
	console.log(response.split("||"));
	if (response.split("||")[1]) {
		const turn = response.split("||")[1];
		if (turn !== CURRENT_USER) {
			document.getElementById("puter").value = turn;
			await gen();
		}
	} else if (message.user !== "Reasoning" && current_interaction.characters.includes("Reasoning")) {
		document.getElementById("puter").value = "Reasoning";
		await gen();
	}
}

function trim(str = "", maxlen = 2000, extraEnders = []) {
	let enders = ['.', '!', '?', '*', '"', ')', '}', '`', ']', ';', '…', ...extraEnders];
	str = str.slice(0,maxlen);
	let end = 0;
	for (const ender of enders) {
		end = Math.max(end, str.lastIndexOf(ender));
	}
	return str.slice(0,end).replace(/[\t\r\n ]+$/, '');
}
const dummy_option = document.createElement("option");
	dummy_option.value = null;
	
function init () {
	for (const [id, source, label, onchange] of [["master", PROMPTS, "Full Character List"], ["master_2", PROMPTS, "Full Character List", true], ["master_3", SCENARIOS, "Scenario", true], ["scenario", SCENARIOS, "Scenario", true]]) {
		
		INTERACTIONS = JSON.parse(localStorage.getItem("interactions") || "[]");
		const full_characters = document.createElement("select");
		full_characters.id = id;
		const blank_character = dummy_option.cloneNode(true);
		if (onchange) full_characters.onchange = function () {
			update(id);
		}
		blank_character.innerText = label;
		full_characters.append(blank_character);
		for (const [character, desc] of Object.entries(source)) {
			const character_option = document.createElement("option");
			character_option.value = character;
			console.log(desc);
			character_option.title = desc;
			character_option.innerText = character;
			full_characters.append(character_option);
		}
		document.getElementById(id).replaceWith(full_characters);
		
		
	}
	
	const interaction_selection = document.createElement("select");
	interaction_selection.id = "interaction";
	interaction_selection.onchange = function () {
		console.log("test");
		update('interaction');
	}
	const blank_interaction = dummy_option.cloneNode(true);
	blank_interaction.innerText = "Interaction";
	interaction_selection.append(blank_interaction);
	for (const interaction of INTERACTIONS) {
		const select = document.createElement("option");
		select.value = interaction;
		select.innerText = interaction;
		interaction_selection.append(select);
	}
	document.getElementById("interaction").replaceWith(interaction_selection);
	if ((current_interaction.id || document.getElementById("interaction_name"))) document.getElementById("interaction").value = current_interaction.id || document.getElementById("interaction_name").value, update("interaction");
	
	/*const scenario_selection = document.createElement("select");
	scenario_selection.id = "scenario";
	
	//scenario_selection.append(dummy_option.cloneNode(true));
	for (const [scenario, desc] of Object.entries(SCENARIOS)) {
		const select = document.createElement("option");
		select.value = scenario;
		select.title = desc;
		select.innerText = scenario;
		scenario_selection.append(select);
	}
	scenario_selection.onchange = update_scenario;
		//current_interaction.scenario = document.getElementById("scenario").value || "none";
	
	document.getElementById("scenario").replaceWith(scenario_selection);*/
}
function appendMessage (message, message_box) {
	
		const message_display = document.createElement("div");
		message_display.id = "message-" + message.id;
		const del = document.createElement("button");
		del.onclick = function () {
			document.getElementById("message-" + message.id).remove();
			current_interaction.memories[message.id].deleted = true;
			localStorage.setItem(`memories-${current_interaction.id}`, JSON.stringify(current_interaction.memories));
		}
		del.innerText = "x";
		
		const edit = document.createElement("button");
		edit.innerText = "Edit";
		edit.onclick = function () {
			document.getElementById("message").value = message.text;
		}
		
		const save = document.createElement("button");
		save.innerText = "Save Edit";
		save.onclick = function () {
			console.log(message.id, document.getElementById("message").value, message.user);
			current_interaction.memories[message.id].text = document.getElementById("message").value;
			document.getElementById("message_text-"+message.id).innerText = document.getElementById("message").value;
			localStorage.setItem(`memories-${current_interaction.id}`, JSON.stringify(current_interaction.memories));
		}
		const username = document.createElement("h3");
		username.innerText = `[${message.user}] `	;
		const message_text = document.createElement("p");
		message_text.id = "message_text-"+message.id;
		message_text.innerText = message.text;
		message_display.append(username, message_text, del, edit, save);
		if (!message.deleted) message_box.append(message_display);
}
function update(type, redo) {
	console.log(type);
	if (type === "message_box") {
		user_character = document.createElement("select");
		ai_character =  document.createElement("select");
		ai_character.id = "puter";
		user_character.id = "user";
		
		const blank_user = dummy_option.cloneNode(true);
		
		const blank_puter = dummy_option.cloneNode(true);
		blank_user.innerText = "User Character";
		blank_puter.innerText = "AI Character";
		
		user_character.append(blank_user);
		ai_character.append(blank_puter);
		for (const character of current_interaction.characters) {
			const selection = document.createElement("option");
			selection.value = character;
			selection.innerText = character;
			selection.title = PROMPTS[character];
			user_character.append(selection.cloneNode(true));
			ai_character.append(selection.cloneNode(true));
		}
		document.getElementById("user").replaceWith(user_character);
		document.getElementById("puter").replaceWith(ai_character);
		document.getElementById("scenario").value = current_interaction.scenario;
	}
	if (type === "interaction") {
		const message_box = document.createElement("div");
		message_box.id = "messages";
		document.getElementById("messages").replaceWith(message_box);
		//console.log("before", document.getElementById("interaction").value);
		if (!document.getElementById("interaction").value) return;
		//console.log("after");
		current_interaction.id = document.getElementById("interaction").value;
		current_interaction.memories = localStorage.getItem(`memories-${current_interaction.id}`);
		current_interaction.memories = JSON.parse(current_interaction.memories);
		current_interaction.characters = localStorage.getItem(`characters-${current_interaction.id}`);
		current_interaction.scenario = localStorage.getItem(`scenario-${current_interaction.id}`);
		current_interaction.characters = JSON.parse(current_interaction.characters);
		update("message_box");
		for (const message of current_interaction.memories) {
			appendMessage(message, message_box);
		}
		
	} else if (type === "scenario") {
		console.log("boo");
		const interaction = document.getElementById("interaction").value;
		if (!INTERACTIONS.includes(interaction) || !interaction) return;
		const scenario = document.getElementById("scenario").value;

		localStorage.setItem(`scenario-${interaction}`, scenario);
		current_interaction.scenario = scenario;
	} else if (type === "master_2") {
		const character = document.getElementById("master_2").value;
		console.log(character);
		document.getElementById("character_name").value = character;
		document.getElementById("character_description").value = PROMPTS[character];
	} else if (type === "master_3") {
		const character = document.getElementById("master_3").value;
		console.log(character);
		document.getElementById("scenario_name").value = character;
		document.getElementById("scenario_description").value = SCENARIOS[character];
	}
	
	
	
}
function create (type) {
	if (type === "interaction") {
		const interaction = document.getElementById("interaction_name").value;
		if (INTERACTIONS.includes(interaction)) return;
		localStorage.setItem(`memories-${interaction}`, "[]");
		localStorage.setItem(`characters-${interaction}`, "[]");
		localStorage.setItem(`scenario-${interaction}`, "none");
		INTERACTIONS.push(interaction);
		localStorage.setItem("interactions", JSON.stringify(INTERACTIONS)); 

	}
	else if (type === "scenario") {
		const name = document.getElementById("scenario_name").value;
		const description = document.getElementById("scenario_description").value;
		if (name && description) {
			SCENARIOS[name] = description;
		}
		
		
	}
	else if (type === "character") {
		const name = document.getElementById("character_name").value;
		const description = document.getElementById("character_description").value;
		if (name && description) {
			PROMPTS[name] = description;
		}
	}
		init();
		update();
}
function del (type) {
	if (type === "interaction") {
		const interaction = document.getElementById("interaction_name").value || document.getElementById("interaction").value;
		if (!INTERACTIONS.includes(interaction) || !interaction) return;
		localStorage.removeItem(`memories-${interaction}`);
		localStorage.removeItem(`characters-${interaction}`);
		localStorage.removeItem(`scenario-${interaction}`);
		delete INTERACTIONS[INTERACTIONS.indexOf(interaction)];
		INTERACTIONS = INTERACTIONS.filter(function (element) {
			return !!element;
		});
		localStorage.setItem("interactions", JSON.stringify(INTERACTIONS));
	} else if (type === "scenario") {
		
		const character = document.getElementById("scenario_name").value;
		if (character) {
			delete SCENARIOS[character];
		}
	} else if (type === "character") {
		
		const character = document.getElementById("character_name").value;
		if (character) {
			delete PROMPTS[character];
		}
	}
		
		init();
		update();
}
function add () {
	console.log("adding");
	const interaction = document.getElementById("interaction").value;
	if (!INTERACTIONS.includes(interaction) || !interaction) return;
	const character = document.getElementById("master").value;
	if (!character || current_interaction.characters.includes(character)) return;
	
	current_interaction.characters.push(character);
	localStorage.setItem(`characters-${interaction}`, JSON.stringify(current_interaction.characters));
	init();
	update("message_box");
}
function remove () {
	const interaction = document.getElementById("interaction").value;
	if (!INTERACTIONS.includes(interaction) || !interaction) return;
	const character = document.getElementById("master").value;
	if (!character || !current_interaction.characters.includes(character)) return;
	
	delete current_interaction.characters[current_interaction.characters.indexOf(character)];
	current_interaction.characters = current_interaction.characters.filter(function (element) {
		return !!element;
	});
	localStorage.setItem(`characters-${interaction}`, JSON.stringify(current_interaction.characters));
	init();
	update("message_box");
}

const TABS = ["settings_tab", "characters_tab", "scenarios_tab", "interactions_tab", "messages"];
function toggleTab (tabname) {
	for (const tab of TABS) {
		console.log(tabname === tab, document.getElementById(tabname).hidden);
		if (tab !== tabname) document.getElementById(tab).hidden = true;
	}
	document.getElementById(tabname).hidden = !(document.getElementById(tabname).hidden || false);
}
function toggleTabs () {
	document.getElementById("other_tabs").hidden = !document.getElementById("other_tabs").hidden;
}
function send () {
	if (!current_interaction.id) return;
	const message = {};
	message.user = document.getElementById("user").value;
	if (message.user === "null") return;
	message.id = current_interaction.memories.length;
	message.text = document.getElementById("message").value;
	if (message.text.length > 1) {
		message.deleted = false;
		current_interaction.memories.push(message);
		localStorage.setItem(`memories-${current_interaction.id}`, JSON.stringify(current_interaction.memories));
		
		
			//const username = document.createElement("h3");
			//username.innerText = `[${message.user}] `	;
			//const message_text = document.createElement("p");
			//message_text.innerText = message.text;
			//message_display.append(username, message_text, del, edit, save);
			appendMessage(message, document.getElementById("messages"));
			
	}
	if (document.getElementById("respond").checked) gen();
	/*document.getElementById("send_message").disabled = true;
	
		for (const message of messages) {
			
		}
		MEMORIES[msg.channel.id].memories += `\n<|eot_id|><|start_header_id|>${WHITELIST[msg.channel.id].user_characters[msg.author.id]}<|end_header_id|>\n\n${WHITELIST[msg.channel.id].user_characters[msg.author.id]}: ${msg.content}`;
		MEMORIES[msg.channel.id].awaiting_user.i = (MEMORIES[msg.channel.id].awaiting_user.i+1) % WHITELIST[msg.channel.id].current_users.length;
		console.log(MEMORIES, WHITELIST);
		MEMORIES[msg.channel.id].awaiting_user.n = WHITELIST[msg.channel.id].current_users[MEMORIES[msg.channel.id].awaiting_user.i];
		console.log(MEMORIES[msg.channel.id].awaiting_user.n, MEMORIES[msg.channel.id].awaiting_user.i);
		let response = await gen(WHITELIST[msg.channel.id], MEMORIES[msg.channel.id], WHITELIST[msg.channel.id].user_characters[MEMORIES[msg.channel.id].awaiting_user.n]);
			
		await webhook(WHITELIST[msg.channel.id].webhook[MEMORIES[msg.channel.id].awaiting_user.n], response);*/
};



function export_file (name, type, content) {
	const file = new File([content], name, {type});
	url = window.URL.createObjectURL(file);
	const a = document.createElement("a");
	a.style = "display: none";
	a.href = url;
	a.download = file.name;
	a.click();
	window.URL.revokeObjectURL(url);
}


function export_button (id) {
	const filetype = "text/javascript";
	let content = "";
	let filename = "";
	if (id === "scenarios") {
		filename = "scenarios.js";
		content = "const SCENARIOS = " + JSON.stringify(SCENARIOS, null, 2) + ";";
	} else if (id === "characters") {
		filename = "prompts.js";
		content = "const PROMPTS = " + JSON.stringify(PROMPTS, null, 2) + ";";
	}
	export_file(filename, filetype, content);
}
setTimeout(init, 1000);