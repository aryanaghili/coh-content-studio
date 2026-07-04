const fs = require('fs');
const path = '/Users/aryanaghili/Documents/coh-content-studio/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const insertBlock = `
        {activeTab === 'operating-core' && (
          <div className="h-full overflow-hidden bg-[#faf9f6]">
            <OperatingCoreAdmin 
              core={operatingCore} 
              onSave={(newCore) => {
                setOperatingCore(newCore);
                localStorage.setItem('coh_operating_core_v1', JSON.stringify(newCore));
              }}
              onReset={() => {
                const defaultCore = createDefaultOperatingCore();
                setOperatingCore(defaultCore);
                localStorage.setItem('coh_operating_core_v1', JSON.stringify(defaultCore));
              }}
            />
          </div>
        )}
`;

content = content.replace("{activeTab === 'command-center' && (", insertBlock + "        {activeTab === 'command-center' && (");
fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx updated successfully');
