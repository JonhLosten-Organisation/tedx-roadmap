
const fs = require('fs');
const html = fs.readFileSync('c:/Users/rleco/Documents/Timeline/tedx_roadmap.html', 'utf8');

// Simple regex extraction for the sake of speed, but structured
const months = [];
const blocks = html.split('<!--');

for (let block of blocks) {
  if (block.includes('2026') || block.includes('2027')) {
    const monthLabelMatch = block.match(/<div class="month-label">(.*?)<\/div>/);
    if (!monthLabelMatch) continue;
    
    const monthLabel = monthLabelMatch[1];
    const milestoneMatch = block.match(/<div class="milestone-badge">(.*?)<\/div>/);
    const kpiMatch = block.match(/<tr class="kpi-row">.*?<td.*?>(.*?)<\/td>.*?<\/tr>/s);
    
    const monthObj = {
      label: monthLabel,
      milestone: milestoneMatch ? milestoneMatch[1] : "",
      kpi: kpiMatch ? kpiMatch[1].replace(/&nbsp;/g, ' ').trim() : "",
      axes: []
    };
    
    // Extract rows
    const rows = block.split('<tr>').slice(2); // Skip header tr
    for (let row of rows) {
      if (row.includes('kpi-row')) continue;
      
      const axeMatch = row.match(/<span class="axe-tag (.*?)">.*?<span class="axe-icon">(.*?)<\/span>(.*?)<\/span>/);
      const actionsMatch = row.match(/<ul class="action-list">(.*?)<\/ul>/s);
      const statusMatch = row.match(/<span class="chip (.*?)">(.*?)<\/span>/);
      
      if (axeMatch) {
        const actionsHtml = actionsMatch[1];
        const actions = [];
        const actionItems = actionsHtml.split('<li>');
        for (let item of actionItems) {
          if (!item.trim()) continue;
          const text = item.split('</li>')[0].trim();
          const isSub = item.includes('sub-item');
          actions.push({
            text: text.replace(/<.*?>/g, '').trim(),
            isSub: isSub
          });
        }

        monthObj.axes.push({
          id: Math.random().toString(36).substr(2, 9),
          type: axeMatch[1],
          icon: axeMatch[2],
          label: axeMatch[3].trim(),
          actions: actions,
          status: {
            type: statusMatch ? statusMatch[1] : "todo",
            label: statusMatch ? statusMatch[2].replace('✓', '').trim() : "À faire"
          }
        });
      }
    }
    months.push(monthObj);
  }
}

fs.writeFileSync('c:/Users/rleco/Documents/Timeline/data.json', JSON.stringify({ months }, null, 2));
console.log('Extracted ' + months.length + ' months');
