from users.models import Users,Income,Expense,File
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import os 
from income.views import extractImage, modelExtract

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
    filesInput = request.FILES.getlist('files')
    
    category = otherCategoryInput if categoryInput == "other" else categoryInput
    subCategory = otherSubCategoryInput if subCategoryInput == "other" else subCategoryInput
    
    expenseIns = Expense.objects.create(userid=user, date=dateInput, category=category, sub_category=subCategory, amount=amountInput, name=nameInput, description=descriptionInput)

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

    category = otherCategoryInput if categoryInput == "other" else categoryInput
    subCategory = otherSubCategoryInput if subCategoryInput == "other" or subCategoryInput == "" else subCategoryInput
    
    expenseInst = Expense.objects.filter(userid=userIns,expenseid=idInput)
    expenseInst.update(date=dateInput, category=category, sub_category=subCategory, amount=amountInput, name=nameInput, description=descriptionInput)

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



@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def extractExpense(request):
    userIns = request.user
    data = request.data

    files = request.FILES.getlist('files')

    return Response({"message": "Expenses info extracted successfully"}, status=status.HTTP_200_OK)


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def addImageExpense(request):
    userIns = request.user
    files = request.FILES.getlist('files')
    
    for singleFile in files:        
        extract_text = extractImage(singleFile)
        thinking_content, content = modelExtract(extract_text)
    
    return Response({"content"},status=status.HTTP_200_OK)