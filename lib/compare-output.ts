export function compareOutput(actual:string,expected:string,input:string,problemId?:string) {
 const normalize=(s:string)=>s.replace(/\r\n/g,'\n').replace(/\n$/,'');
 if(!problemId)return normalize(actual)===normalize(expected);
 try {
  const answer=JSON.parse(actual),wanted=JSON.parse(expected);
  if(problemId==='pair'||problemId==='sorted-pair'){
   const [nums,target]=JSON.parse(input);
   if(!Array.isArray(answer))return false;
   if(answer.length===0){const seen=new Set<number>();for(const x of nums){if(seen.has(target-x))return false;seen.add(x);}return true;}
   return answer.length===2 && answer.every(i=>Number.isInteger(i)&&i>=0&&i<nums.length) && answer[0]!==answer[1] && nums[answer[0]]+nums[answer[1]]===target;
  }
  return JSON.stringify(answer)===JSON.stringify(wanted);
 }catch{return false;}
}
