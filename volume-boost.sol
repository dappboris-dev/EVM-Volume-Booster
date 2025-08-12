// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Router02 {
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] memory path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountInWEI, address[] memory path)
        external
        view
        returns (uint256[] memory amounts);

    function WETH() external pure returns (address);
}

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract VolumeBooster {
    address public owner;
    IUniswapV2Router02 public uniswapRouter;

    event EthDeposited(address indexed sender, uint256 amount);
    event EthWithdrawn(address indexed owner, uint256 amount);
    event ApproveToken(address indexed token, address router);
    event BuySellExecuted(
        address indexed token,
        uint256 ethSpent,
        uint256 tokensBought
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(address _routerAddress) {
        owner = msg.sender;
        uniswapRouter = IUniswapV2Router02(_routerAddress);
    }

    // Function to accept ETH and store in the contract
    receive() external payable {
        emit EthDeposited(msg.sender, msg.value);
    }

    // Function to withdraw ETH to the owner
    function withdrawEth(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance");
        payable(owner).transfer(_amount);
        emit EthWithdrawn(owner, _amount);
    }

    // Function to approve token
    function approveToken(address _tokenAddress) public {
        uint256 approveAmount = 10000000000000000000000000000000000;
        IERC20(_tokenAddress).approve(address(uniswapRouter), approveAmount);
        emit ApproveToken(_tokenAddress, address(uniswapRouter));
    }

    /**
     * @dev Executes a buy-sell transaction on Uniswap in one go
     * @param _tokenAddress The address of the ERC20 token
     */
    function executeBuySell(address _tokenAddress) external payable {
        require(msg.sender.balance > 0, "Insufficient ETH balance");

        uint256 _ethAmount = msg.value;

        // Define the path for buying and selling: ETH -> Token -> ETH
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = _tokenAddress;

        // Buy tokens
        uniswapRouter.swapExactETHForTokens{value: _ethAmount}(
            0, // accept any amount of Tokens
            path,
            address(this), // tokens go to this contract
            block.timestamp + 15 // deadline is 15 seconds from now
        );

        uint256 tokensBought = IERC20(_tokenAddress).balanceOf(address(this));

        // Sell tokens back to ETH
        path[0] = _tokenAddress;
        path[1] = uniswapRouter.WETH();

        uniswapRouter.swapExactTokensForETH(
            tokensBought,
            0, // accept any amount of ETH
            path,
            msg.sender, // ETH goes back to msg.sender
            block.timestamp + 15 // deadline is 15 seconds from now
        );

        emit BuySellExecuted(_tokenAddress, _ethAmount, tokensBought);
    }
}