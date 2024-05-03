import PDFParser from 'pdf2json';

const { SlashCommandBuilder } = require('discord.js');
const fs =  require("fs")
const path = require("path") ;
const Groq = require("groq-sdk");
const crypto = require("crypto");

const groq = new Groq({
  apiKey: process.env.GROQ_TOKEN,
});

const categories = {
  parent: "Category 1",
  children: [
    {
      child: "Subcategory 1.1",
      subchildren: [
        {
          subchild: "Subsubcategory 1.1.1",
          summary: "Summary of the content related to Subsubcategory 1.1.1",
        },
        {
          subchild: "Subsubcategory 1.1.2",
          summary: "Summary of the content related to Subsubcategory 1.1.2",
        },
      ],
    },
    {
      child: "Subcategory 1.2",
      subchildren: [
        {
          subchild: "Subsubcategory 1.2.1",
          summary: "Summary of the content related to Subsubcategory 1.2.1",
        },
      ],
    },
  ],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("categorise-pdf")
    .setDescription("categorise and summarise a pdf")
    .addAttachmentOption((option) =>
      option
        .setName("pdf")
        .setDescription("upload your pdf here")
        .setRequired(true)
    ),
  async execute(interaction) {
    let parsedText = "";

    const pdfAttachment = interaction.options.getAttachment("pdf");

    const tempDir = path.join(process.cwd(), "temp");
    const tempFilePath = path.join(
      tempDir,
      `uploadedFile_${crypto.randomUUID()}.temp`
    );

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    if (!pdfAttachment) {
      await interaction.reply("No PDF file uploaded.");
      return;
    }

    const buffer = await pdfAttachment.fetch();
    await fs.promises.writeFile(tempFilePath, buffer);

    const pdfParser = new PDFParser(null, 1);

    const pdfPromise = new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) =>
        reject(errData.parserError)
      );
      pdfParser.on("pdfParser_dataReady", async () => {
        const text = pdfParser.getRawTextContent().replace(/\s+/g, "");

        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a JSON generator, your goal is to categorise a text that comes from various mime types of files based on this JSON architecture: ${categories}. Respond with a parent category, a child, a subchild, and a short summary of the content. You can render in your response only with a JSON format.`,
              },
              {
                role: "user",
                content: `Give me only a JSON object that categorises this text: ${text.slice(
                  0,
                  Math.min(1000, text.length)
                )}.`,
              },
            ],
            model: "mixtral-8x7b-32768",
          });
          parsedText = chatCompletion.choices[0]?.message?.content;
          resolve(parsedText);
        } catch (error) {
          console.error("Error processing file:", error);
          reject("An error occurred while processing the file");
        }
      });

      pdfParser.loadPDF(tempFilePath);
    });

    parsedText = await pdfPromise;

    await fs.promises.unlink(tempFilePath);

    const embedFields = [];

    parsedText.categories.forEach((category) => {
      category.children.forEach((subcategory) => {
        subcategory.subchildren.forEach((subsubcategory) => {
          const field = {
            name: `**${category.parent}** > **${subcategory.child}** > **${subsubcategory.subchild}**`,
            value: subsubcategory.summary,
            inline: false,
          };
          embedFields.push(field);
        });
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
