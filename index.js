
let replying = false;
const current_interaction = {};
let INTERACTIONS = [];
async function gen () {
	if (!current_interaction.id) return;
	const api_body = {
	  "max_context_length": 8000,
	  "max_length": 300,
	  "prompt":  "\n\n",
	  "quiet": false,
	  "rep_pen": 1.1,
	  "rep_pen_range": 256,
	  "rep_pen_slope": 1,
	  "temperature": 0.9,
	  "tfs": 1,
	  "top_a": 0,
	  "top_k": 100,
	  "top_p": 0.9,
	  "typical": 1
	};
	for (const user of current_interaction.characters) {
		api_body.prompt += `\n\n<|eot_id|><|start_header_id|>${user}<|end_header_id|>${user}: ${PROMPTS[user]}`;
	}
	api_body.prompt += `<|eot_id|><|start_header_id|>Scenario<|end_header_id|>Scenario: ${SCENARIOS[current_interaction.scenario]}`;
	api_body.prompt += "\n\n---------Interaction Start---------\n\n";
	for (const memory of current_interaction.memories) {
		if (!memory.deleted) 	api_body.prompt += `\n\n<|eot_id|><|start_header_id|>${memory.user}<|end_header_id|>${memory.user}: ${memory.text}`;
	}
	const character = document.getElementById("puter");
	if (!character) return;
	api_body.prompt += `\n\n<|eot_id|><|start_header_id|>${character.value}<|end_header_id|>${character.value}: `;
	
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
	//return ;
	const message = {};
	message.user = document.getElementById("puter").value;
	message.id = current_interaction.memories.length;
	message.text = response;
	message.deleted = false;
	current_interaction.memories.push(message);
	appendMessage(message, document.getElementById("messages"));
	localStorage.setItem(`memories-${current_interaction.id}`, JSON.stringify(current_interaction.memories));
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
	INTERACTIONS = JSON.parse(localStorage.getItem("interactions") || "[]");
	const full_characters = document.createElement("select");
	full_characters.id = "master";
	full_characters.append(dummy_option.cloneNode(true));
	for (const [character, desc] of Object.entries(PROMPTS)) {
		const character_option = document.createElement("option");
		character_option.value = character;
		console.log(desc);
		character_option.title = desc;
		character_option.innerText = character;
		full_characters.append(character_option);
	}
	document.getElementById("master").replaceWith(full_characters);
	
	const interaction_selection = document.createElement("select");
	interaction_selection.id = "interaction";
	interaction_selection.onchange = function () {
		console.log("test");
		update();
	}
	interaction_selection.append(dummy_option.cloneNode(true));
	for (const interaction of INTERACTIONS) {
		const select = document.createElement("option");
		select.value = interaction;
		select.innerText = interaction;
		interaction_selection.append(select);
	}
	document.getElementById("interaction").replaceWith(interaction_selection);
	
	
	const scenario_selection = document.createElement("select");
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
	
	document.getElementById("scenario").replaceWith(scenario_selection);
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
function update() {
	const message_box = document.createElement("div");
	message_box.id = "messages";
	document.getElementById("messages").replaceWith(message_box);
	console.log("before", document.getElementById("interaction").value);
	if (!document.getElementById("interaction").value) return;
	console.log("after");
	current_interaction.id = document.getElementById("interaction").value;
	current_interaction.memories = localStorage.getItem(`memories-${current_interaction.id}`);
	current_interaction.memories = JSON.parse(current_interaction.memories);
	current_interaction.characters = localStorage.getItem(`characters-${current_interaction.id}`);
	current_interaction.characters = JSON.parse(current_interaction.characters);
	user_character = document.createElement("select");
	ai_character =  document.createElement("select");
	ai_character.id = "puter";
	user_character.id = "user";
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
	for (const message of current_interaction.memories) {
		appendMessage(message, message_box);
	}
}
function create () {
	const interaction = document.getElementById("interaction_name").value;
	if (INTERACTIONS.includes(interaction)) return;
	localStorage.setItem(`memories-${interaction}`, "[]");
	localStorage.setItem(`characters-${interaction}`, "[]");
	localStorage.setItem(`scenario-${interaction}`, "none");
	INTERACTIONS.push(interaction);
	localStorage.setItem("interactions", JSON.stringify(INTERACTIONS)); 
	init();
	update();
}
function del () {
	const interaction = document.getElementById("interaction").value;
	if (!INTERACTIONS.includes(interaction) || !interaction) return;
	localStorage.removeItem(`memories-${interaction}`);
	localStorage.removeItem(`characters-${interaction}`);
	localStorage.removeItem(`scenario-${interaction}`);
	delete INTERACTIONS[INTERACTIONS.indexOf(interaction)];
	INTERACTIONS = INTERACTIONS.filter(function (element) {
		return !!element;
	});
	localStorage.setItem("interactions", JSON.stringify(INTERACTIONS));
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
	update();
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
	update();
}

function update_scenario() {
	console.log("boo");
	const interaction = document.getElementById("interaction").value;
	if (!INTERACTIONS.includes(interaction) || !interaction) return;
	const scenario = document.getElementById("scenario").value;

	localStorage.setItem(`scenario-${interaction}`, scenario);
	current_interaction.scenario = scenario;
}
function send () {
	if (!current_interaction.id) return;
	const message = {};
	message.user = document.getElementById("user").value;
	message.id = current_interaction.memories.length;
	message.text = document.getElementById("message").value;
	message.deleted = false;
	current_interaction.memories.push(message);
	localStorage.setItem(`memories-${current_interaction.id}`, JSON.stringify(current_interaction.memories));
	
	
		//const username = document.createElement("h3");
		//username.innerText = `[${message.user}] `	;
		//const message_text = document.createElement("p");
		//message_text.innerText = message.text;
		//message_display.append(username, message_text, del, edit, save);
		appendMessage(message, document.getElementById("messages"));
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

setTimeout(init, 1000);