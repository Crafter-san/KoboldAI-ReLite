const SETTINGS = {
	"url": "http://127.0.0.1:5001",
	"utils": 
		{
			"FILEFORMAT": `#### Multi-purpose File Structure with Emojis

				**Emoji Indicators:**
				- :star2:: Signals the start and end of the entire file content.
				- :scroll:: Encompasses the start and end of the metadata section.
				- :art:: Delimits each metadata name.
				- :pencil2:: Wraps each metadata value.
				- :space_invader:: Marks the beginning and end of the actual file content.

				**Universal Template:**

				\`\`\`
				🌟  
				📜  
				 🎨 FILENAME 🎨  ✏️ [YOUR_FILENAME] ✏️ 
				 🎨 FILETYPE 🎨  ✏️ [YOUR_FILETYPE] ✏️ 
				 🎨 [OPTIONAL_META_NAME] 🎨  ✏️ [OPTIONAL_META_VALUE] ✏️ 
				 📜  
				 👾  
				 [YOUR FILE CONTENT HERE]
				 👾 
				 🌟 
				\`\`\`

				**How to Use:**

				1. Substitute \`[YOUR_FILENAME]\` and \`[YOUR_FILETYPE]\` with your respective file name and type.
				2. Optionally, add more metadata using \`🎨 [OPTIONAL_META_NAME] 🎨\` and \`✏️ [OPTIONAL_META_VALUE] ✏️\` as needed.
				3. Enclose your actual file content within \`👾 ... 👾\`.
				4. This playful template can handle a variety of files, from code snippets to text documents, bringing order and flair to your files!

				Ready to tackle whatever file you toss its way, and it looks cute too! :star2:`
		}
};