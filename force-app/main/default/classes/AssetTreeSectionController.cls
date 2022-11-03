public class AssetTreeSectionController {
    public Tree theTree {get;set;}
    public String nid {get;set;}
    public Id assetId {get;set;}
    public Id rootAssetId {get;set;}
    
    public AssetTreeSectionController(ApexPages.StandardController stdController){
        this.assetId = stdController.getId();
        if(assetId != null) {
        	Asset assetObj = [select Id, 
				ParentId, 
				Parent.ParentId, 
				Parent.Parent.ParentId, 
				Parent.Parent.Parent.ParentId, 
				Parent.Parent.Parent.Parent.ParentId, 
				Parent.Parent.Parent.Parent.Parent.ParentId
				from Asset where Id = :assetId
			];
            rootAssetId = getRootAssetId(assetObj);
        }
    }
    
    private void buildAssetTree() {
		theTree = new Tree();
		Asset rootAsset = [select Id, Name, (select Id, Name from ChildAssets) from Asset where Id = :rootAssetId];        
		theTree.root = new TreeNode(rootAssetId, rootAsset.Name);
        if(rootAssetId == assetId) theTree.root.current = true;
        recursivelyBuildTree(theTree.root, rootAsset);
    }
    
    private void recursivelyBuildTree(TreeNode parentNode, Asset parentAsset) {
        Set<Id> assetIds = new Set<Id>();
        for(Asset childAsset : parentAsset.ChildAssets) {
            assetIds.add(childAsset.Id);
        }
        
        for(Asset childAsset : [select Id, Name, (select Id, Name from ChildAssets) from Asset where Id in :assetIds]) {
            TreeNode childNode = new TreeNode(childAsset.Id, childAsset.Name);
	        if(childAsset.Id == assetId) childNode.current = true;
            parentNode.addChild(childNode);
            recursivelyBuildTree(childNode, childAsset);
        }
    }
    
    private Id getRootAssetId(Asset assetObj) {
        if(assetObj.ParentId == null) return assetObj.Id;
        else {
            if(assetObj.Parent.ParentId != null) {
	            if(assetObj.Parent.Parent.ParentId != null) {
                    if(assetObj.Parent.Parent.Parent.ParentId != null) {
                        if(assetObj.Parent.Parent.Parent.Parent.ParentId != null) {
                            if(assetObj.Parent.Parent.Parent.Parent.Parent.ParentId != null) {
                                return assetObj.Parent.Parent.Parent.Parent.Parent.ParentId;
                            }else{
                                return assetObj.Parent.Parent.Parent.Parent.ParentId;
                            }
                        }else{
                            return assetObj.Parent.Parent.Parent.ParentId;
                        }
                    }else{
                        return assetObj.Parent.Parent.ParentId;
                    }
                }else{
                    return assetObj.Parent.ParentId;
                }
            }else{
                return assetObj.ParentId;
            }
        }
        return null;
    }

    /*
    public AssetTreeSectionController(){
    }*/
    
    public PageReference initAction() {
        if(this.assetId != null) {
            buildAssetTree();
        }/* else{
            theTree = new Tree();
            theTree.root = new TreeNode('Root', 'Tree Group Header');
            theTree.root.expanded = true;
            theTree.root.addChild(new TreeNode('L10', 'L1 Item #1'));
            theTree.root.addChild(new TreeNode('L11', 'L1 Branch #2'));
            theTree.root.getChild(0).current = true;
            theTree.root.getChild(1).expanded = true;
            theTree.root.getChild(1).addChild(new TreeNode('L21', 'L2 Branch #1'));
            theTree.root.getChild(1).getChild(0).expanded = true;
            theTree.root.getChild(1).getChild(0).addChild(new TreeNode('L31', 'L3 Branch #1'));
            theTree.root.getChild(1).getChild(0).getChild(0).expanded = true;
            theTree.root.getChild(1).getChild(0).getChild(0).addChild(new TreeNode('L41', 'L4 Item #1'));
            theTree.root.getChild(1).getChild(0).getChild(0).addChild(new TreeNode('L42', 'L4 Branch #2'));
            theTree.root.getChild(1).getChild(0).getChild(0).getChild(1).expanded = true;
            theTree.root.getChild(1).getChild(0).getChild(0).getChild(1).addChild(new TreeNode('L51', 'L5 Item #1'));
            theTree.root.getChild(1).getChild(0).getChild(0).getChild(1).addChild(new TreeNode('L52', 'L5 Branch #2'));
            theTree.root.getChild(1).getChild(0).getChild(0).getChild(1).getChild(1).expanded = true;
            theTree.root.getChild(1).getChild(0).getChild(0).getChild(1).getChild(1).addChild(new TreeNode('L61', 'L6 Item #1'));
            theTree.root.addChild(new TreeNode('L13', 'L1 Branch #3'));
            theTree.root.getChild(2).addChild(new TreeNode('L22', 'L2 Item #2'));
            theTree.root.addChild(new TreeNode('L14', 'L1 Item #4'));
        } */
        return null;
    }
    
    public PageReference onClickNodeAction() {
        system.debug('onClickNodeAction: nid=' +nid);
        if(!String.isBlank(nid)) {
            recursivelyExpandOrCollapseNode(theTree.root, nid);
        }
        nid = null;
		return null;
    }
    
    private Boolean recursivelyExpandOrCollapseNode(TreeNode parentNode, String nid) {
        system.debug('recursivelyExpandOrCollapseNode on ' +parentNode.id + ' for ' + nid);
        if(parentNode.id == nid) {
            parentNode.expanded = !parentNode.expanded;
            return true;
        }
        for(TreeNode n : parentNode.children) {
            if(n.id == nid) {
                system.debug('found '+nid);
                n.expanded = !n.expanded;
                return true;
            }
        }

        for(TreeNode n : parentNode.children) {
            Boolean result = recursivelyExpandOrCollapseNode(n, nid);
            if(result) return result;
        }

        return false;
    }

    public class Tree {
        public TreeNode root {get;set;}
    }

    public class TreeNode {
        public String id {get;set;}
        public TreeNode parent {get;set;}
        public List<TreeNode> children {get;set;}
        public String title {get;set;}
        public Boolean expanded {get;set;}
        public Boolean current {get;set;}
        
        public TreeNode(String id, String title) {
            this.id = id;
            this.title = title;
            this.children = new List<TreeNode>();
            this.expanded = true;
            this.current = false;
        }
        
        public Boolean hasChildren {
            get {
                return !this.children.isEmpty();
            }
        }
        
        public TreeNode getChild(Integer idx) {
            return this.children.get(idx);
        }
        
        public void addChild(TreeNode n) {
            n.parent = this;
            this.children.add(n);
        }
        
        public String buttonCss {
            get {
                return !hasChildren ? ' slds-is-disabled' : '';
            }
        }

        public String titleCss {
            get {
                return current ? ' current' : '';
            }
        }
    }
}