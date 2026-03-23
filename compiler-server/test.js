
const { generateFile } = require('./generateFile');

(async () => {
    const filePath = await generateFile('cpp', `
class Solution {
public:
    int maximum(vector<int>& piles) { 
        int maxi = INT_MIN; 
        for(int i = 0; i < piles.size(); i++) 
            maxi = max(maxi, piles[i]); 
        return maxi; 
    }
    long long calculateTotalHours(vector<int> &piles,int hourly){ 
        long long ans = 0; 
        for(int i=0;i<piles.size();i++) 
            ans += ceil((double)piles[i]/(double)hourly); 
        return ans; 
    }
    int minEatingSpeed(vector<int>& piles,int h){ 
        int low=1, high=maximum(piles); 
        while(low<=high){ 
            int mid=(low+high)/2; 
            long long totalH = calculateTotalHours(piles,mid); 
            if(totalH<=h) high=mid-1; 
            else low=mid+1; 
        } 
        return low; 
    }
};
`, {
        functionName: 'minEatingSpeed',
        className: 'Solution',
        arguments: ['piles','h']
    });

    console.log('Generated file path:', filePath);
})();
