import * as vscode from 'vscode';
import { postWarning, postInformation } from '../helper/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsyaml = require('js-yaml');
const icons = [
	{
		name: 'Quickstart',
		icon: 'docon-topic-quickstart'
	},
	{
		name: 'Overview',
		icon: 'docon-topic-overview'
	},
	{
		name: 'Whats-new',
		icon: 'docon-topic-whats-new'
	},
	{
		name: 'Concept',
		icon: 'docon-topic-concept'
	},
	{
		name: 'Learn',
		icon: 'docon-topic-learn'
	},
	{
		name: 'Tutorial',
		icon: 'docon-topic-tutorial'
	},
	{
		name: 'Download',
		icon: 'docon-topic-download'
	},
	{
		name: 'Architecture',
		icon: 'docon-topic-architecture'
	},
	{
		name: 'Deploy',
		icon: 'docon-topic-deploy'
	},
	{
		name: 'get-started',
		icon: 'docon-topic-get-started'
	},
	{
		name: 'how-to-guide',
		icon: 'docon-topic-how-to-guide'
	},
	{
		name: 'reference',
		icon: 'docon-topic-reference'
	},
	{
		name: 'video',
		icon: 'docon-topic-video '
	}
];
export class YamlContentProvider implements vscode.TextDocumentContentProvider {
	private sourceUri: vscode.Uri;
	public provideTextDocumentContent(styleUri: vscode.Uri): Thenable<string> {
		const editor = vscode.window.activeTextEditor;
		this.sourceUri = editor.document.uri;

		return vscode.workspace.openTextDocument(this.sourceUri).then(async document => {
			const content = document.getText();
			if (!content.startsWith('### YamlMime:Landing')) {
				postWarning('Yaml Preview is designed for Microsoft YamlMime:Landing');
			}
			const html = await this.buildHtmlFromContent(content);
			return this.setStyle(html, styleUri);
		});
	}

	private async buildHtmlFromContent(content: string): Promise<string> {
		const body = await this.parseFileYamlHtml(content);
		//original 	<section class="primary-holder column is-two-thirds-tablet is-three-quarters-desktop">
		return `<!DOCTYPE html>
        <html>
				<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0,shrink-to-fit=no">
							<link rel="stylesheet" type="text/css" href="StyleUri">
				</head>
				
				<body class="theme-light" lang="en-us" dir="ltr">
					<section class="primary-holder column">
						<div class="class="columns  has-large-gaps ">
				 			<div id="main-column" class="column is-full is-11-widescreen">
	  						<main id="main" role="main" class="content" data-bi-name="content" lang="en-us" dir="ltr"> 
									${body}
								</main>
							</div>
						</div>
					</section>
        </body>
				</html>`;
	}
	private setStyle(html: string, styleSrc: vscode.Uri) {
		const previewThemeSetting: string = 'preview.previewTheme';
		html = html.replace(new RegExp('href=(.*)"', 'i'), 'href="' + styleSrc?.toString() + '"');
		const selectedPreviewTheme = vscode.workspace.getConfiguration().get(previewThemeSetting);
		const bodyClassRegex = new RegExp('body class="(.*)"', 'i');
		switch (selectedPreviewTheme) {
			case 'Light':
				html = html.replace(bodyClassRegex, 'body class="theme-light"');
				break;
			case 'Dark':
				html = html.replace(bodyClassRegex, 'body class="theme-dark"');
				break;
			case 'High Contrast':
				html = html.replace(bodyClassRegex, 'body class="theme-high-contrast"');
				break;
		}
		return html;
	}
	private async parseFileYamlHtml(Content: string) {
		let yamlObj: any;
		try {
			yamlObj = jsyaml.safeLoad(Content);
		} catch (e) {
			return '<br><span class="is-size-h5 docon docon-status-failure-outline" aria-hidden="true"> YAML Syntax Error :( </span>';
		}
		let body = '';
		let title = '';
		let summary = '';
		let landingContent = '';
		if (yamlObj.title) {
			title = yamlObj.title;
		}
		if (yamlObj.summary) {
			summary = yamlObj.summary;
		}
		if (yamlObj.metadata) {
		}
		if (yamlObj.landingContent) {
			for (const card in yamlObj.landingContent) {
				let cardContent = '';
				if (yamlObj.landingContent[card].title) {
					cardContent += this.createCardTitle(yamlObj.landingContent[card].title);
				}
				if (yamlObj.landingContent[card].linkLists) {
					for (const key in yamlObj.landingContent[card].linkLists) {
						let text = '';
						let url = '';
						if (yamlObj.landingContent[card].linkLists[key].linkListType) {
							cardContent += this.createCardSubTitle(
								yamlObj.landingContent[card].linkLists[key].linkListType
							);
						}
						if (yamlObj.landingContent[card].linkLists[key].links) {
							let links = '';
							for (const link in yamlObj.landingContent[card].linkLists[key].links) {
								if (yamlObj.landingContent[card].linkLists[key].links[link].text) {
									text = yamlObj.landingContent[card].linkLists[key].links[link].text;
								}
								if (yamlObj.landingContent[card].linkLists[key].links.url) {
									url = yamlObj.landingContent[card].linkLists[key].links[link].text;
								}
								links += this.createList(url, text);
							}
							cardContent += this.wrapLinks(links);
						}
					}
				}
				landingContent += this.createCard(cardContent);
			}
		} else {
		}
		body += this.createHeaderSection(title, summary);
		body += this.createContentSection(landingContent);
		return body;
	}

	private createHeaderSection(title: string, summary: string) {
		let html: string = '';
		html += '<section id="landing-head">';
		html +=
			'<div class="has-padding-top-small has-padding-bottom-medium"> <div class="column is-full">';
		html += '<h1 class="is-size-h2">';
		html += title;
		html += '</h1>';
		html += '<p class="has-margin-top-small has-line-height-reset">';
		html += summary;
		html += '</p> </div></div> </section>';
		return html;
	}

	private createContentSection(landingContent: string) {
		let html: string = '';
		html +=
			'<section id="landing-content" class="has-padding-top-medium has-padding-bottom-medium">';
		html += '<div class="columns is-masonry is-three-masonry-columns">';
		html += landingContent;
		html += '</div> </seciton>';
		return html;
	}

	private createCard(cardContent: string) {
		let html: string = '';
		html +=
			'<div class="column is-12 is-4-desktop"> <div class="box has-box-shadow-medium has-margin-none has-margin-small">';
		html += cardContent;
		html += '</div> </div>';
		return html;
	}

	private createCardTitle(title: string) {
		let html: string = '';
		html += '<h2 class="has-margin-none is-size-4">';
		html += title;
		html += '</h2>';
		return html;
	}
	private createCardSubTitle(subtitle: string) {
		let html: string = '';
		html +=
			'<h3 class="is-flex is-uppercase is-size-7 has-border-top has-margin-bottom-small has-margin-top-medium has-padding-top-medium has-text-subtle">';
		html += this.titleToIcon(subtitle);
		if (subtitle === 'whats-new') html += 'What&#39;s new';
		else {
			html += subtitle;
		}
		html += '</h3>';
		return html;
	}
	private createList(url: string, text: string) {
		let html: string = '';
		html += '<li class="is-unstyled has-padding-top-small has-padding-bottom-small">';
		html += `
		<a class="is-size-small is-block" href="${url}" 
		data-linktype="relative-path">${text}</a>
		`;
		html += '</li>';

		return html;
	}
	private wrapLinks(links: string) {
		return '<ul class="has-margin-none has-line-height-reset">' + links + '</ul>';
	}

	private titleToIcon(name: string) {
		const icon = icons.find(icon => icon.name.match(new RegExp(name, 'i')));
		return `
      <span class="has-margin-right-extra-small has-flex-align-self-center is-size-h5 docon ${icon?.icon}" aria-hidden="true"></span>
      `;
	}
}
