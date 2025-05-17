from users.models import Users,Income,Expense,File
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import os 
import re
import pytesseract
from PIL import Image
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Create your views here.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addExpense(request):
    user = request.user

    dateInput = request.data['date']
    categoryInput = request.data['category'].lower()
    otherCategoryInput = request.data['otherCategory'].lower()
    subCategoryInput = request.data['sub_category'].lower()
    otherSubCategoryInput = request.data['otherSubCategory'].lower()
    amountInput = request.data['amount']
    nameInput = request.data['name'].lower()
    descriptionInput = request.data['description']
    deductibleInput = request.data['isDeductible'].lower()

    deductibleInput = True if deductibleInput == "true" or deductibleInput == "yes" else False

    filesInput = request.FILES.getlist('files')
    
    category = otherCategoryInput if categoryInput == "other" else categoryInput
    subCategory = otherSubCategoryInput if subCategoryInput == "other" else subCategoryInput
    
    expenseIns = Expense.objects.create(
        userid=user,
        date=dateInput,
        category=category,
        sub_category=subCategory,
        amount=amountInput,
        name=nameInput,
        description=descriptionInput,
        deductible=deductibleInput
    )
    for files in filesInput:
        filepath = f'{user.userid}/{files.name}'
        file_content = files.read()
        file_instance = File.objects.create(
            expenseid=expenseIns,
            filepath=filepath
        )
        
        file_instance.file.save(
            filepath,
            files,
            save=True
        )
        
    return Response({"message": "Expense added successfully"},status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def viewAllExpenses(request):
    user = request.user
    expenses = Expense.objects.filter(userid=user).order_by('-expenseid')

    expenses_data = []
    totalExpensesYear = {}
    monthlyExpensesByYear = {}
    averageExpensesYear = {}
    averageExpensesYear1 = {}
    category = {}
    subCategory = {}

    for expense in expenses:
        year = str(expense.date).split('-')[0]
        month = str(expense.date).split('-')[1]
        amount = float(expense.amount)
        files = File.objects.filter(expenseid=expense.expenseid)
        file = [file.filepath for file in files]
        expenses_data.append({
            'id': expense.pk,
            'date': expense.date,
            'expense_name': expense.name,
            'category': expense.category,
            'sub_category': expense.sub_category,
            'amount': str(expense.amount),
            'description': expense.description,
            'deductible': expense.deductible,
            'file': file
        })
        if year not in totalExpensesYear:
            totalExpensesYear[year] = 0
            monthlyExpensesByYear[year] = {
                '01': 0, '02': 0, '03': 0, '04': 0,
                '05': 0, '06': 0, '07': 0, '08': 0,
                '09': 0, '10': 0, '11': 0, '12': 0
            }
            category[year] = {}
        if expense.category not in category[year]:
            category[year][expense.category] = 0
        category[year][expense.category] += amount
        totalExpensesYear[year] += amount
        monthlyExpensesByYear[year][month] += amount
    
    for year in totalExpensesYear:
        months_with_expense = sum(1 for m in monthlyExpensesByYear[year].values() if m > 0)
        averageExpensesYear[year] = round(totalExpensesYear[year] / max(months_with_expense, 1), 2)
        averageExpensesYear1[year] = round(totalExpensesYear[year] / 12, 2)

    return Response({
        "expense": expenses_data,
        "totalExpenses": totalExpensesYear,
        "averageExpenses": averageExpensesYear,
        "averageExpenses1": averageExpensesYear1,
        "monthly": monthlyExpensesByYear,
        "category":category,
    },status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def editExpenses(request):
    userIns = request.user
    data = request.data

    idInput = request.data['id']
    dateInput = request.data['date']
    categoryInput = request.data['category'].lower()
    otherCategoryInput = request.data['otherCategory'].lower()
    subCategoryInput = request.data['sub_category'].lower()
    otherSubCategoryInput = request.data['otherSubCategory'].lower()
    amountInput = request.data['amount']
    nameInput = request.data['name'].lower()
    descriptionInput = request.data['description']
    deductibleInput = request.data['deductible'].lower()

    deductibleInput = True if deductibleInput == "true" or deductibleInput == "yes" else False
    
    category = otherCategoryInput if categoryInput == "other" else categoryInput
    subCategory = otherSubCategoryInput if subCategoryInput == "other" or subCategoryInput == "" else subCategoryInput
    
    expenseInst = Expense.objects.filter(userid=userIns,expenseid=idInput)
    expenseInst.update(date=dateInput, category=category, sub_category=subCategory, amount=amountInput, name=nameInput, description=descriptionInput,deductible=deductibleInput)

    return Response({"message": "Income updated successfully"}, status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def deleteExpenses(request):
    userIns = request.user
    data = request.data

    id = data['expenseid']
    
    expense = Expense.objects.filter(userid=userIns, pk=id).first()
    expense.delete()

    fileToDelete = File.objects.filter(expenseid=expense.pk)
    fileToDelete.delete()
    return Response({"message": "Expense deleted successfully"}, status=status.HTTP_200_OK)


def extractImage(image_path):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    myconfig = r"--psm 6 --oem 3"
    # Extract text using pytesseract
    extract_text = pytesseract.image_to_string(Image.open(image_path), config=myconfig)

    return extract_text

model_name = "Qwen/Qwen3-0.6B"
global_tokenizer = None
global_model = None

def get_model_and_tokenizer():
    global global_tokenizer, global_model
    
    if global_tokenizer is None or global_model is None:
        global_tokenizer = AutoTokenizer.from_pretrained(model_name)
        global_model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype="auto",
            device_map="auto"
        )
    return global_tokenizer, global_model

def modelExtract(extracted_text):
    tokenizer, model = get_model_and_tokenizer()

    # prepare the model input
    prompt =f"""
    You are a tax deduction assistant.

    Analyze the receipt text provided and extract the following information in structured form:

    - Vendor Name
    - Date
    - Category (based on deduction type)
    - Sub-Category (specific deduction type)
    - Total Amount
    - Is Deductible (Yes/No)
    - Summary (summarize the expense of the receipt or message)

    Receipt Text:
    {extracted_text}

    Refer to the following deduction rules to decide if the expense is tax deductible:

    1. Self, Parents, Spouse
    - Individual relief (RM9000 fixed)
    - Medical expenses for parents (Max RM8000)
    - Spouse/alimony with no income or joint assessment (Max RM4000)

    2. Medical Expenses (Max RM10,000)
    - Serious disease, vaccination, fertility treatment
    - Medical/mental health checkups (RM1000 sub-limit)
    - Learning disability intervention (RM4000 sub-limit)

    3. Lifestyle
    - Books, electronics, internet, sports equipment, EV charging (Max RM2500)
    - Sports activities such as entrance fees and competition fees (Max RM500)

    4. Education & Skills
    - Tuition fees in Mala

    Your task:
    - Determine whether the expense is deductible.
    - If deductible, assign the most accurate *Category* and *Sub-Category* based on the rules below.
    - If the item doesn't clearly fit any category, *mark it as "Not Deductible"* and do not force a sub-category.

    Examples:
    - "iPad" → Lifestyle → Electronics
    - "RTK Test" → Medical Expenses → Medical check-up
    - "Tuition fees" → Education → Education fees
    - "Sports shoes" → Lifestyle → Sports activity

    Return your answer in this format:
    Structured Breakdown:
    - Vendor Name:
    - Date:
    - Category:
    - Sub-Category:
    - Total Amount:
    - Is Deductible:
    - Summary:
    
    """

    messages = [
        {"role": "user", "content": prompt}
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=True # Switches between thinking and non-thinking modes. Default is True.
    )
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    # conduct text completion
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=32768
    )
    output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist() 

    try:
        index = len(output_ids) - output_ids[::-1].index(151668)
    except ValueError:
        index = 0

    thinking_content = tokenizer.decode(output_ids[:index], skip_special_tokens=True).strip("\n")
    content = tokenizer.decode(output_ids[index:], skip_special_tokens=True).strip("\n")

    return content


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def extractFile(request):
    userIns = request.user
    data = request.data

    path = request.FILES.getlist('file')
    
    extract_text = ''
    for file in path:
        extract_text = extractImage(file)
        extract_text += '\n'

    content = modelExtract(extract_text)
    content = re.sub(r'[^\x00-\x7F]+', '', content)
    content = content.replace("\n"," ")

    vendor_pattern = r'- Vendor Name:(.*?)(?=- |$)'
    date_pattern = r'- Date:(.*?)(?=- |$)'
    category_pattern = r'- Category:(.*?)(?=- |$)'
    sub_category_pattern = r'- Sub-Category:(.*?)(?=- |$)'
    is_deductible_pattern = r'- Is Deductible:(.*?)(?=- |$)'
    amount_pattern = r'- Total Amount:(.*?)(?=- |$)'
    summary_pattern = r'- Summary:(.*?)(?=- |$)'
    
    vendor_match = re.search(vendor_pattern, content, re.DOTALL)
    vendor = vendor_match.group(1).strip()
    date_match = re.search(date_pattern, content, re.DOTALL)
    date = date_match.group(1).strip()
    category_match = re.search(category_pattern, content, re.DOTALL)
    category = category_match.group(1).strip()
    sub_category_match = re.search(sub_category_pattern, content, re.DOTALL)
    sub_category = sub_category_match.group(1).strip()
    is_deductible_match = re.search(is_deductible_pattern, content, re.DOTALL)
    isDeductible = is_deductible_match.group(1).strip()
    amount_match = re.search(amount_pattern, content, re.DOTALL)
    amount = amount_match.group(1).strip()
    if "RM" in amount:
        amount = amount.replace("RM","")
    summary_match = re.search(summary_pattern, content, re.DOTALL)
    summary = summary_match.group(1).strip()

    contentImage = {"name":vendor,"date":date,"category":category,"sub_category":sub_category,"isDeductible":isDeductible,"amount":amount,"summary":summary}
    
    return Response({"imageText":contentImage}, status=status.HTTP_200_OK)
